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

        console.log(`Sessão restaurada com sucesso: ${gameId}`);
    } catch (error) {
        console.error('Erro ao restaurar sessão anterior:', error);
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
        <strong>Nome:</strong> <code>${data.masked_name}</code><br>
        <strong>Região:</strong> ${data.regiao}<br>
        <strong>Tipo:</strong> ${data.tipo} | <strong>Raça:</strong> ${data.raca}<br>
        <strong>Obrigatório:</strong> ${data.obrigatorio}
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
        if (!response.ok) throw new Error('Não foi possível iniciar o jogo.');
        
        const data = await response.json();
        gameId = data.game_id;
        console.log(`Nova sessão criada: ${gameId}`);
    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
        alert('Erro ao conectar com o servidor. Certifique-se de que o backend FastAPI está rodando!');
    }
}

// Carregar lista de nomes dos bosses para o autocomplete
async function loadBossList() {
    try {
        const response = await fetch('/api/bosses/names');
        if (!response.ok) throw new Error('Erro ao carregar chefes.');
        
        allBosses = await response.json();
        console.log(`Total de bosses carregados: ${allBosses.length}`);
    } catch (error) {
        console.error('Erro ao carregar lista de bosses:', error);
    }
}

// Buscar detalhes completos de um boss para preencher a linha da tabela
async function getBossDetails(bossName) {
    try {
        const response = await fetch(`/api/boss/details/${encodeURIComponent(bossName)}`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes do chefe.');
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar detalhes de ${bossName}:`, error);
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
                    if (errData.detail && errData.detail.includes("Sessão")) {
                        alert("Sua sessão de jogo expirou ou o servidor foi reiniciado. Um novo jogo será iniciado.");
                        localStorage.removeItem('eldendle_session');
                        await startNewGame();
                        return;
                    }
                } catch (e) {
                    // Ignora erro ao tentar ler o JSON
                }
                alert(`O boss "${guessName}" não foi encontrado no banco de dados!`);
            } else {
                throw new Error('Falha no processamento do palpite.');
            }
            inputSearch.disabled = false;
            return;
        }
        
        const feedback = await responseGuess.json();

        // Busca os detalhes do chefe que foi chutado para colocar na tela
        const bossDetails = await getBossDetails(guessName);
        if (!bossDetails) {
            alert('Não foi possível carregar os detalhes do boss chutado.');
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
        console.error('Erro ao enviar palpite:', error);
        alert('Ocorreu um erro ao enviar seu palpite.');
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

    // Criação dos conteúdos de cada célula formatada em português
    const formatSimNao = (bool) => bool ? 'Sim' : 'Não';
    const formatMilhares = (num) => num.toLocaleString('pt-BR');

    // 1. BOSS (Nome + Imagem)
    const tdBoss = document.createElement('td');
    tdBoss.className = getCellClass(feedback.nome);
    const bossImgUrl = getBossImageUrl(boss.nome);
    const fallbackImgUrl = getBossImageUrl('');
    tdBoss.innerHTML = `
        <div class="boss-cell-content" style="cursor: pointer;" onclick="window.open('https://www.google.com/search?tbm=isch&q=Elden+Ring+${encodeURIComponent(boss.nome)}', '_blank')" title="Pesquisar imagens no Google">
            <img class="boss-cell-img" src="${bossImgUrl}" onerror="this.src='${fallbackImgUrl}'" alt="${boss.nome}">
            <span class="boss-cell-name" title="${boss.nome}">${boss.nome}</span>
        </div>
    `;

    // 2. REGIAO
    const tdRegiao = document.createElement('td');
    tdRegiao.className = getCellClass(feedback.regiao);
    tdRegiao.textContent = boss.regiao;

    // 3. FASE (Com setas se maior/menor)
    const tdFase = document.createElement('td');
    tdFase.className = getCellClass(feedback.fase);
    tdFase.innerHTML = renderNumericCell(boss.fase, feedback.fase);

    // 4. TIPO
    const tdTipo = document.createElement('td');
    tdTipo.className = getCellClass(feedback.tipo);
    tdTipo.textContent = translateTipo(boss.tipo);

    // 5. RAÇA
    const tdRaca = document.createElement('td');
    tdRaca.className = getCellClass(feedback.raca);
    tdRaca.textContent = translateRaca(boss.raca);

    // 6. LOCALIZAÇÃO ESPECÍFICA
    const tdLocalizacao = document.createElement('td');
    tdLocalizacao.className = getCellClass(feedback.localizacao_especifica);
    tdLocalizacao.textContent = boss.localizacao_especifica;

    // 7. DROP PRINCIPAL
    const tdDrop = document.createElement('td');
    tdDrop.className = getCellClass(feedback.drop_principal);
    tdDrop.textContent = boss.drop_principal;

    // 8. OBRIGATÓRIO
    const tdObrigatorio = document.createElement('td');
    tdObrigatorio.className = getCellClass(feedback.obrigatorio);
    tdObrigatorio.textContent = formatSimNao(boss.obrigatorio);

    // 9. RUNAS (Com setas se maior/menor)
    const tdRunas = document.createElement('td');
    tdRunas.className = getCellClass(feedback.runes);
    tdRunas.innerHTML = renderNumericCell(formatMilhares(boss.runes), feedback.runes);

    // Adiciona as células na linha
    row.appendChild(tdBoss);
    row.appendChild(tdRegiao);
    row.appendChild(tdFase);
    row.appendChild(tdTipo);
    row.appendChild(tdRaca);
    row.appendChild(tdLocalizacao);
    row.appendChild(tdDrop);
    row.appendChild(tdObrigatorio);
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
            <span class="arrow-indicator" title="${status === 'higher' ? 'O valor correto é maior' : 'O valor correto é menor'}">${arrow}</span>
        </div>
    `;
}

// Tradução de Tipos
function translateTipo(tipo) {
    const traducoes = {
        'Demigod': 'Semideus',
        'Legend': 'Lenda',
        'God': 'Deus',
        'Great Enemy': 'Grande Inimigo',
        'Enemy': 'Inimigo'
    };
    return traducoes[tipo] || tipo;
}

// Tradução de Raças
function translateRaca(raca) {
    const traducoes = {
        'Humanoid': 'Humanoide',
        'Beast': 'Fera',
        'Serpent': 'Serpente',
        'Omen': 'Augúrio',
        'Giant': 'Gigante',
        'Dragon': 'Dragão',
        'Spirit': 'Espírito',
        'Malformed Star': 'Estrela Deformada',
        'Avatar': 'Avatar',
        'Gargoyle': 'Gárgula'
    };
    return traducoes[raca] || raca;
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
        const fallbackImgUrl = getBossImageUrl('');
        
        item.innerHTML = `
            <img class="suggestion-img" src="${bossImgUrl}" onerror="this.src='${fallbackImgUrl}'" alt="${name}">
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
            e.preventDefault();
            const selectedName = items[currentSelectionIndex].dataset.name;
            selectSuggestion(selectedName);
        } else {
            // Chuta direto o texto escrito se coincidir exatamente
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
    victoryImg.src = getBossImageUrl(boss.nome);
    
    document.getElementById('victory-boss-name').textContent = boss.nome;
    
    const showcase = document.getElementById('victory-boss-showcase');
    showcase.style.cursor = 'pointer';
    showcase.title = 'Pesquisar imagens no Google';
    showcase.onclick = () => window.open(`https://www.google.com/search?tbm=isch&q=Elden+Ring+${encodeURIComponent(boss.nome)}`, '_blank');
    
    const formatMilhares = (num) => num.toLocaleString('pt-BR');
    document.getElementById('victory-boss-details').innerHTML = `
        <strong>Região:</strong> ${boss.regiao} (${boss.localizacao_especifica})<br>
        <strong>Tipo:</strong> ${translateTipo(boss.tipo)} | <strong>Raça:</strong> ${translateRaca(boss.raca)}<br>
        <strong>Fase:</strong> ${boss.fase} | <strong>Drop:</strong> ${boss.drop_principal}<br>
        <strong>Runas:</strong> ${formatMilhares(boss.runes)} | <strong>Obrigatório:</strong> ${boss.obrigatorio ? 'Sim' : 'Não'}
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
        if (confirm('Tem certeza de que deseja zerar todas as suas estatísticas de jogo? Isso não poderá ser desfeito.')) {
            const stats = { played: 0, won: 0, streak: 0, maxStreak: 0 };
            saveStats(stats);
            alert('Estatísticas redefinidas com sucesso.');
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
                if (!response.ok) throw new Error('Erro ao buscar dica.');
                
                sessionHintData = await response.json();
                saveSession();
                checkHintButtonAvailability();
            } catch (error) {
                console.error('Erro ao buscar dica:', error);
                alert('Ocorreu um erro ao obter a dica. Certifique-se de que o servidor está rodando.');
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
