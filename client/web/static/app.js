/**
 * ==========================================================================
 * ELDENDLE - MOTOR DE LOGICA DO JOGO (JAVASCRIPT)
 * ==========================================================================
 */

// Estado Global da Partida
let gameId = null;
let allBosses = []; // Apenas os nomes dos bosses para o autocomplete
let guessedBosses = []; // Bosses já chutados nesta rodada
let isGameOver = false;
let currentSelectionIndex = -1;

// Estado Adicional (Persistência e Dicas)
let currentGuessesList = []; // Armazena objetos { boss, feedback }
let sessionHintData = null; // Dados da dica do boss atual
let lastVictoryBoss = null; // Detalhes do boss vitorioso para F5

// Elementos do DOM
const inputSearch = document.getElementById('boss-search');
const suggestionsContainer = document.getElementById('suggestions');
const btnGuess = document.getElementById('btn-guess');
const attemptsCountEl = document.getElementById('attempts-count');
const guessTbody = document.getElementById('guess-tbody');
const emptyState = document.getElementById('empty-state');

// Modais
const modalHelp = document.getElementById('modal-help');
const modalStats = document.getElementById('modal-stats');
const modalVictory = document.getElementById('modal-victory');

// Botões dos Modais
const btnHelpOpen = document.getElementById('btn-help');
const btnStatsOpen = document.getElementById('btn-stats');
const btnResetStats = document.getElementById('btn-reset-stats');
const btnRestart = document.getElementById('btn-restart');

// Função auxiliar para carregar a imagem do boss de uma fonte segura (Fandom API via backend)
function getBossImageUrl(bossName) {
    if (!bossName) {
        return 'https://static.wikia.nocookie.net/eldenring/images/1/10/Elden_Ring_logo.png/revision/latest/scale-to-width-down/200';
    }
    return `/api/boss/image/${encodeURIComponent(bossName)}`;
}

// Salvar a sessão atual no localStorage
function saveSession() {
    if (!gameId) return;
    localStorage.setItem('eldendle_session', JSON.stringify({
        gameId,
        guessedBosses,
        isGameOver,
        victoryBoss: isGameOver ? lastVictoryBoss : null,
        guesses: currentGuessesList,
        hintData: sessionHintData
    }));
}

// Restaurar a sessão salva no localStorage (F5)
async function restoreSession() {
    // Carrega a lista de chefes primeiro para que o autocomplete e filtros funcionem
    await loadBossList();

    const sessionDataStr = localStorage.getItem('eldendle_session');
    if (!sessionDataStr) {
        await startNewGame();
        return;
    }

    try {
        const session = JSON.parse(sessionDataStr);
        gameId = session.gameId;
        guessedBosses = session.guessedBosses || [];
        isGameOver = session.isGameOver || false;
        currentGuessesList = session.guesses || [];
        sessionHintData = session.hintData || null;
        lastVictoryBoss = session.victoryBoss || null;

        // Atualiza a visualização do DOM
        guessTbody.innerHTML = '';
        if (guessedBosses.length > 0) {
            emptyState.style.display = 'none';
        } else {
            emptyState.style.display = 'block';
        }

        attemptsCountEl.textContent = guessedBosses.length;

        // Renderiza as tentativas salvas
        currentGuessesList.forEach(item => {
            const boss = item.boss || item.bossDetails;
            addGuessRowToTable(boss, item.feedback);
        });

        // Configura inputs
        inputSearch.disabled = isGameOver;
        btnGuess.disabled = true;

        // Atualiza estado do botão de dica
        checkHintButtonAvailability();

        // Se o jogo já acabou, reabre a tela de vitória
        if (isGameOver && lastVictoryBoss) {
            renderVictoryModal(lastVictoryBoss);
            openModal(modalVictory);
        }

        console.log(`Session restored successfully: ${gameId}`);
    } catch (error) {
        console.error('Error restoring previous session:', error);
        localStorage.removeItem('eldendle_session');
        await startNewGame();
    }
}

// Verificar elegibilidade e exibição do botão de dica (a partir de 10 tentativas)
function checkHintButtonAvailability() {
    const btnHint = document.getElementById('btn-hint');
    const hintBox = document.getElementById('hint-display-box');
    const hintText = document.getElementById('hint-text');

    if (!btnHint || !hintBox || !hintText) return;

    if (isGameOver) {
        btnHint.style.display = 'none';
        return;
    }

    if (sessionHintData) {
        btnHint.style.display = 'none';
        hintBox.style.display = 'block';
        hintText.innerHTML = formatHintText(sessionHintData);
    } else if (guessedBosses.length >= 10) {
        btnHint.style.display = 'block';
        hintBox.style.display = 'none';
    } else {
        btnHint.style.display = 'none';
        hintBox.style.display = 'none';
    }
}

function formatHintText(data) {
    if (!data) return '';
    return `
        <strong>Name:</strong> <code>${data.masked_name}</code><br>
        <strong>Region:</strong> ${data.region}<br>
        <strong>Type:</strong> ${data.type} | <strong>Race:</strong> ${data.race}<br>
        <strong>Mandatory:</strong> ${data.mandatory} | <strong>DLC:</strong> ${data.dlc}
    `;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Restaura o jogo salvo ou inicia um novo
    await restoreSession();
    setupEventListeners();
    updateStatsDisplay();
});

// ==========================================================================
// FUNÇÕES DE COMUNICAÇÃO COM O SERVIDOR (API FASTAPI)
// ==========================================================================

// Iniciar uma nova sessão de jogo no servidor
async function startNewGame() {
    try {
        isGameOver = false;
        guessedBosses = [];
        currentGuessesList = [];
        sessionHintData = null;
        lastVictoryBoss = null;
        localStorage.removeItem('eldendle_session');

        // Atualiza a exibição da dica (esconde tudo)
        checkHintButtonAvailability();

        attemptsCountEl.textContent = '0';
        guessTbody.innerHTML = '';
        emptyState.style.display = 'block';
        inputSearch.value = '';
        inputSearch.disabled = false;
        btnGuess.disabled = true;
        
        const response = await fetch('/app/game/start', { method: 'POST' });
        if (!response.ok) throw new Error('Could not start the game.');
        
        const data = await response.json();
        gameId = data.game_id;
        console.log(`New session created: ${gameId}`);
    } catch (error) {
        console.error('Error starting the game:', error);
        alert('Error connecting to the server. Make sure the FastAPI backend is running!');
    }
}

// Carregar lista de nomes dos bosses para o autocomplete
async function loadBossList() {
    try {
        const response = await fetch('/api/bosses/names');
        if (!response.ok) throw new Error('Error loading bosses.');
        
        allBosses = await response.json();
        console.log(`Total bosses loaded: ${allBosses.length}`);
    } catch (error) {
        console.error('Error loading boss list:', error);
    }
}

// Buscar detalhes completos de um boss para preencher a linha da tabela
async function getBossDetails(bossName) {
    try {
        const response = await fetch(`/api/boss/details/${encodeURIComponent(bossName)}`);
        if (!response.ok) throw new Error('Error fetching boss details.');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for ${bossName}:`, error);
        return null;
    }
}

// Enviar palpite ao servidor
async function submitGuess(guessName) {
    if (isGameOver || guessedBosses.includes(guessName)) return;

    try {
        // Desativa controles enquanto processa
        inputSearch.disabled = true;
        btnGuess.disabled = true;

        // Envia o chute (POST)
        const responseGuess = await fetch(`/api/guess/${gameId}/${encodeURIComponent(guessName)}`, {
            method: 'POST'
        });
        if (!responseGuess.ok) {
            if (responseGuess.status === 404) {
                try {
                    const errData = await responseGuess.json();
                    if (errData.detail && errData.detail.includes("session")) {
                        alert("Your game session has expired or the server was restarted. A new game will begin.");
                        localStorage.removeItem('eldendle_session');
                        await startNewGame();
                        return;
                    }
                } catch (e) {
                    // Ignora erro ao tentar ler o JSON
                }
                alert(`O boss "${guessName}" não foi encontrado no banco de dados!`);
            } else {
                throw new Error('Failed to process guess.');
            }
            inputSearch.disabled = false;
            return;
        }
        
        const feedback = await responseGuess.json();

        // Busca os detalhes do chefe que foi chutado para colocar na tela
        const bossDetails = await getBossDetails(guessName);
        if (!bossDetails) {
            alert('Could not load details for the guessed boss.');
            inputSearch.disabled = false;
            return;
        }

        // Registra palpite
        guessedBosses.push(guessName);
        currentGuessesList.push({ boss: bossDetails, feedback: feedback });
        attemptsCountEl.textContent = guessedBosses.length;
        emptyState.style.display = 'none';

        // Salva a sessão no localStorage
        saveSession();

        // Renderiza palpite na tabela com animações
        addGuessRowToTable(bossDetails, feedback);

        // Limpa input e atualiza botões/dicas
        inputSearch.value = '';
        inputSearch.disabled = false;
        closeSuggestions();
        checkHintButtonAvailability();

        // Checar vitória (se todos os campos forem 'correct')
        const won = Object.values(feedback).every(status => status === 'correct');
        if (won) {
            handleVictory(bossDetails);
        }
    } catch (error) {
        console.error('Error submitting guess:', error);
        alert('An error occurred while submitting your guess.');
        inputSearch.disabled = false;
    }
}

// ==========================================================================
// RENDERIZAÇÃO E INTERFACE GRÁFICA
// ==========================================================================

// Adiciona uma nova linha com animação 3D flip card
function addGuessRowToTable(boss, feedback) {
    const row = document.createElement('tr');
    row.className = 'guess-row';

    // Criação dos conteúdos de cada célula formatada em inglês
    const formatYesNo = (bool) => bool ? 'Yes' : 'No';
    const formatThousands = (num) => num.toLocaleString('en-US');

    // 1. BOSS (Name + Image)
    const tdBoss = document.createElement('td');
    tdBoss.className = getCellClass(feedback.name);
    const bossImgUrl = getBossImageUrl(boss.name);
    tdBoss.innerHTML = `
        <div class="boss-cell-content" style="cursor: pointer;" onclick="window.open('https://www.google.com/search?tbm=isch&q=Elden+Ring+${encodeURIComponent(boss.name)}', '_blank')" title="Search images on Google">
            <img class="boss-cell-img" src="${bossImgUrl}" alt="${boss.name}" referrerpolicy="no-referrer">
            <span class="boss-cell-name" title="${boss.name}">${boss.name}</span>
        </div>
    `;

    // 2. REGION
    const tdRegiao = document.createElement('td');
    tdRegiao.className = getCellClass(feedback.region);
    tdRegiao.textContent = boss.region;

    // 3. PHASE (Com setas se maior/menor)
    const tdFase = document.createElement('td');
    tdFase.className = getCellClass(feedback.phase);
    tdFase.innerHTML = renderNumericCell(boss.phase, feedback.phase);

    // 4. TYPE
    const tdTipo = document.createElement('td');
    tdTipo.className = getCellClass(feedback.type);
    tdTipo.textContent = boss.type;

    // 5. RACE
    const tdRaca = document.createElement('td');
    tdRaca.className = getCellClass(feedback.race);
    tdRaca.textContent = boss.race;

    // 6. SPECIFIC LOCATION
    const tdLocalizacao = document.createElement('td');
    tdLocalizacao.className = getCellClass(feedback.specific_location);
    tdLocalizacao.textContent = boss.specific_location;

    // 7. MANDATORY
    const tdObrigatorio = document.createElement('td');
    tdObrigatorio.className = getCellClass(feedback.mandatory);
    tdObrigatorio.textContent = formatYesNo(boss.mandatory);

    // 8. DLC
    const tdDlc = document.createElement('td');
    tdDlc.className = getCellClass(feedback.dlc);
    tdDlc.textContent = formatYesNo(boss.dlc);

    // 9. RUNES (with arrows if higher/lower)
    const tdRunas = document.createElement('td');
    tdRunas.className = getCellClass(feedback.runes);
    tdRunas.innerHTML = renderNumericCell(formatThousands(boss.runes), feedback.runes);

    // Add cells to the row
    row.appendChild(tdBoss);
    row.appendChild(tdRegiao);
    row.appendChild(tdFase);
    row.appendChild(tdTipo);
    row.appendChild(tdRaca);
    row.appendChild(tdLocalizacao);
    row.appendChild(tdObrigatorio);
    row.appendChild(tdDlc);
    row.appendChild(tdRunas);

    // Insere no topo da tabela de palpites para melhor visibilidade
    guessTbody.insertBefore(row, guessTbody.firstChild);
}

// Retorna classe CSS para as dicas
function getCellClass(status) {
    if (status === 'correct') return 'cell-correct';
    if (status === 'partial') return 'cell-partial';
    return 'cell-incorrect';
}

// Renderiza indicador direcional de maior/menor para fases e runas
function renderNumericCell(val, status) {
    if (status === 'correct') {
        return `<div>${val}</div>`;
    }
    const arrow = status === 'higher' ? '🔼' : '🔽';
    return `
        <div class="cell-numeric">
            <span>${val}</span>
            <span class="arrow-indicator" title="${status === 'higher' ? 'The correct value is higher' : 'The correct value is lower'}">${arrow}</span>
        </div>
    `;
}

// ==========================================================================
// LÓGICA DO AUTOCOMPLETE SUSPENSO
// ==========================================================================

function updateSuggestions(query) {
    suggestionsContainer.innerHTML = '';
    currentSelectionIndex = -1;

    if (!query) {
        closeSuggestions();
        return;
    }

    // Filtra os bosses que contém o termo digitado e que não foram chutados ainda
    const filtered = allBosses.filter(name => 
        name.toLowerCase().includes(query.toLowerCase()) && 
        !guessedBosses.includes(name)
    );

    if (filtered.length === 0) {
        closeSuggestions();
        return;
    }

    filtered.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.name = name;
        item.dataset.index = index;

        // Foto miniatura baseada no nome usando a nova API
        const bossImgUrl = getBossImageUrl(name);
        
        item.innerHTML = `
            <img class="suggestion-img" src="${bossImgUrl}" alt="${name}">
            <span class="suggestion-name">${name}</span>
        `;

        item.addEventListener('click', () => {
            selectSuggestion(name);
        });

        suggestionsContainer.appendChild(item);
    });

    suggestionsContainer.style.display = 'block';
}

function selectSuggestion(name) {
    inputSearch.value = name;
    closeSuggestions();
    btnGuess.disabled = false;
    inputSearch.focus();
}

function closeSuggestions() {
    suggestionsContainer.style.display = 'none';
    suggestionsContainer.innerHTML = '';
    currentSelectionIndex = -1;
}

// Navegação do autocomplete por teclado
function handleKeyboardNavigation(e) {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentSelectionIndex = (currentSelectionIndex + 1) % items.length;
        highlightSuggestion(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentSelectionIndex = (currentSelectionIndex - 1 + items.length) % items.length;
        highlightSuggestion(items);
    } else if (e.key === 'Enter') {
        if (currentSelectionIndex > -1) {
            // Highlighted item → submit it directly
            e.preventDefault();
            const selectedName = items[currentSelectionIndex].dataset.name;
            closeSuggestions();
            submitGuess(selectedName);
        } else if (items.length > 0) {
            // QoL: No item highlighted but list is open → submit first item
            e.preventDefault();
            const firstName = items[0].dataset.name;
            closeSuggestions();
            submitGuess(firstName);
        } else {
            // Fall back: exact match on typed text
            const matchedName = allBosses.find(name => name.toLowerCase() === inputSearch.value.trim().toLowerCase());
            if (matchedName && !guessedBosses.includes(matchedName)) {
                e.preventDefault();
                submitGuess(matchedName);
            }
        }
    } else if (e.key === 'Escape') {
        closeSuggestions();
    }
}

function highlightSuggestion(items) {
    items.forEach(item => item.classList.remove('active'));
    if (currentSelectionIndex > -1) {
        const activeItem = items[currentSelectionIndex];
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ block: 'nearest' });
        inputSearch.value = activeItem.dataset.name;
        btnGuess.disabled = false;
    }
}

// ==========================================================================
// ESTATÍSTICAS E PERSISTÊNCIA LOCAL (LOCALSTORAGE)
// ==========================================================================

function getStats() {
    const stats = localStorage.getItem('eldendle_stats');
    if (stats) return JSON.parse(stats);

    return {
        played: 0,
        won: 0,
        streak: 0,
        maxStreak: 0
    };
}

function saveStats(stats) {
    localStorage.setItem('eldendle_stats', JSON.stringify(stats));
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const stats = getStats();
    document.getElementById('stat-played').textContent = stats.played;
    
    const winrate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    document.getElementById('stat-winrate').textContent = `${winrate}%`;
    
    document.getElementById('stat-streak').textContent = stats.streak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;
}

function renderVictoryModal(boss) {
    const victoryImg = document.getElementById('victory-boss-img');
    victoryImg.src = getBossImageUrl(boss.name);
    
    document.getElementById('victory-boss-name').textContent = boss.name;
    
    const showcase = document.getElementById('victory-boss-showcase');
    showcase.style.cursor = 'pointer';
    showcase.title = 'Search images on Google';
    showcase.onclick = () => window.open(`https://www.google.com/search?tbm=isch&q=Elden+Ring+${encodeURIComponent(boss.name)}`, '_blank');
    
    const formatThousands = (num) => num.toLocaleString('en-US');
    document.getElementById('victory-boss-details').innerHTML = `
        <strong>Region:</strong> ${boss.region} (${boss.specific_location})<br>
        <strong>Type:</strong> ${boss.type} | <strong>Race:</strong> ${boss.race}<br>
        <strong>Phase:</strong> ${boss.phase} | <strong>Mandatory:</strong> ${boss.mandatory ? 'Yes' : 'No'}<br>
        <strong>DLC:</strong> ${boss.dlc ? 'Yes' : 'No'} | <strong>Runes:</strong> ${formatThousands(boss.runes)}
    `;

    document.getElementById('victory-attempts').textContent = guessedBosses.length;
}

function handleVictory(boss) {
    isGameOver = true;
    lastVictoryBoss = boss;
    inputSearch.disabled = true;
    btnGuess.disabled = true;

    // Atualiza estatísticas locais
    const stats = getStats();
    stats.played += 1;
    stats.won += 1;
    stats.streak += 1;
    if (stats.streak > stats.maxStreak) {
        stats.maxStreak = stats.streak;
    }
    saveStats(stats);

    // Salva a sessão atualizada indicando o fim de jogo e o boss vitorioso
    saveSession();

    // Mostra o Modal de Vitória
    renderVictoryModal(boss);

    // Atraso sutil para o jogador ver as células terminarem o flip antes do modal de vitória
    setTimeout(() => {
        openModal(modalVictory);
    }, 2000);
}

// ==========================================================================
// CONTROLE DE EVENTOS & MODAIS
// ==========================================================================

function setupEventListeners() {
    // Input de busca
    inputSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        updateSuggestions(query);

        // Habilita/Desabilita botão de chute se o nome escrito for válido na lista
        const matched = allBosses.find(name => name.toLowerCase() === query.toLowerCase());
        btnGuess.disabled = !matched || guessedBosses.includes(matched);
    });

    inputSearch.addEventListener('keydown', handleKeyboardNavigation);

    // Botão de chutar
    btnGuess.addEventListener('click', () => {
        const guessName = inputSearch.value.trim();
        const matchedName = allBosses.find(name => name.toLowerCase() === guessName.toLowerCase());
        if (matchedName) {
            submitGuess(matchedName);
        }
    });

    // Fechar autocomplete se clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            closeSuggestions();
        }
    });

    // Botões dos Modais de Header
    btnHelpOpen.addEventListener('click', () => openModal(modalHelp));
    btnStatsOpen.addEventListener('click', () => openModal(modalStats));

    // Fechar Modais ao clicar no X ou fora do card
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    // Resetar estatísticas
    btnResetStats.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all your game statistics? This cannot be undone.')) {
            const stats = { played: 0, won: 0, streak: 0, maxStreak: 0 };
            saveStats(stats);
            alert('Statistics reset successfully.');
            closeAllModals();
        }
    });

    // Jogar novamente (Reiniciar)
    btnRestart.addEventListener('click', () => {
        closeAllModals();
        startNewGame();
    });

    // Botão de Dica (Graça de Dica)
    const btnHint = document.getElementById('btn-hint');
    if (btnHint) {
        btnHint.addEventListener('click', async () => {
            if (!gameId || isGameOver) return;
            try {
                btnHint.disabled = true;
                const response = await fetch(`/api/game/hint/${gameId}`);
                if (!response.ok) throw new Error('Error fetching hint.');
                
                sessionHintData = await response.json();
                saveSession();
                checkHintButtonAvailability();
            } catch (error) {
                console.error('Error fetching hint:', error);
                alert('An error occurred while obtaining the hint. Make sure the server is running.');
            } finally {
                btnHint.disabled = false;
            }
        });
    }
}

function openModal(modal) {
    closeAllModals();
    modal.classList.add('open');
}

function closeAllModals() {
    modalHelp.classList.remove('open');
    modalStats.classList.remove('open');
    modalVictory.classList.remove('open');
}
