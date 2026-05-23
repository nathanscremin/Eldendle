/**
 * ==========================================================================
 * ELDENDLE - EMOJI MODE (PARTE 2)
 * ==========================================================================
 */

(function() {
    let emojiGameId = null;
    let emojiGuessedBosses = [];
    let emojiIsGameOver = false;

    const emojiInputSearch = document.getElementById('emoji-boss-search');
    const emojiSuggestions = document.getElementById('emoji-suggestions');
    const btnEmojiGuess = document.getElementById('btn-emoji-guess');
    const emojiAttemptsEl = document.getElementById('emoji-attempts-count');
    const emojiTbody = document.getElementById('emoji-guess-tbody');
    const emojiEmptyState = document.getElementById('emoji-empty-state');
    const emojiBoxes = [
        document.getElementById('emoji-box-1'),
        document.getElementById('emoji-box-2'),
        document.getElementById('emoji-box-3'),
        document.getElementById('emoji-box-4'),
        document.getElementById('emoji-box-5')
    ];

    let emojiSelectionIndex = -1;

    function getEmojiDailyBossKey() {
        const keys = Object.keys(BOSS_DATABASE);
        // Usamos uma semente ligeiramente diferente concatenando '_emoji' para que o boss do dia não seja sempre igual ao modo classico
        const dateStr = getCurrentDateKey() + "_emoji";
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
            hash |= 0; 
        }
        const index = Math.abs(hash) % keys.length;
        return keys[index];
    }

    function saveEmojiSession() {
        if (!emojiGameId) return;
        const sessionKey = currentMode === 'daily' ? `eldendle_emoji_daily_${getCurrentDateKey()}` : 'eldendle_emoji_endless';
        localStorage.setItem(sessionKey, JSON.stringify({
            gameId: emojiGameId,
            guessedBosses: emojiGuessedBosses,
            isGameOver: emojiIsGameOver
        }));
    }

    window.emojiRestoreSession = async function() {
        if (allBosses.length === 0) await loadBossList(); // from app.js

        const sessionKey = currentMode === 'daily' ? `eldendle_emoji_daily_${getCurrentDateKey()}` : 'eldendle_emoji_endless';
        const sessionDataStr = localStorage.getItem(sessionKey);
        
        if (!sessionDataStr) {
            await emojiStartNewGame();
            return;
        }

        try {
            const session = JSON.parse(sessionDataStr);
            emojiGameId = session.gameId;
            emojiGuessedBosses = session.guessedBosses || [];
            emojiIsGameOver = session.isGameOver || false;

            updateEmojiUI();

            if (emojiIsGameOver) {
                const lastGuess = emojiGuessedBosses[emojiGuessedBosses.length - 1];
                if (lastGuess === emojiGameId) {
                    renderVictoryModal(BOSS_DATABASE[emojiGameId], emojiGuessedBosses.length);
                } else if (emojiGuessedBosses.length >= 5) {
                    // Perdeu no limite de tentativas
                    renderVictoryModal(BOSS_DATABASE[emojiGameId], emojiGuessedBosses.length);
                    document.getElementById('victory-boss-details').innerHTML = `<strong>Game Over! You ran out of attempts!</strong><br>The secret boss was ${emojiGameId}.`;
                    document.querySelector('.victory-title').textContent = "YOU DIED";
                    document.querySelector('.victory-title').style.color = "#c91a25";
                }
            }
        } catch (e) {
            localStorage.removeItem(sessionKey);
            await emojiStartNewGame();
        }
    };

    window.emojiStartNewGame = async function() {
        emojiIsGameOver = false;
        emojiGuessedBosses = [];
        
        const sessionKey = currentMode === 'daily' ? `eldendle_emoji_daily_${getCurrentDateKey()}` : 'eldendle_emoji_endless';
        localStorage.removeItem(sessionKey);

        if (currentMode === 'daily') {
            emojiGameId = getEmojiDailyBossKey();
        } else {
            const keys = Object.keys(BOSS_DATABASE);
            emojiGameId = keys[Math.floor(Math.random() * keys.length)];
        }

        // Restaura a cor do modal de vitória pro padrão
        const vicTitle = document.querySelector('.victory-title');
        if(vicTitle) {
            vicTitle.textContent = "ENEMY FELLED";
            vicTitle.style.color = "#e0be5b";
        }

        updateEmojiUI();
    }

    function updateEmojiUI() {
        emojiTbody.innerHTML = '';
        emojiAttemptsEl.textContent = emojiGuessedBosses.length;

        if (emojiGuessedBosses.length > 0) {
            emojiEmptyState.style.display = 'none';
        } else {
            emojiEmptyState.style.display = 'block';
        }

        // Renderiza os palpites na tabela de trás pra frente (mais recente em cima)
        const reversedGuesses = [...emojiGuessedBosses].reverse();
        reversedGuesses.forEach(guess => {
            const row = document.createElement('tr');
            row.className = 'guess-row';
            
            const tdName = document.createElement('td');
            tdName.textContent = guess;
            tdName.className = (guess === emojiGameId) ? 'cell-correct' : 'cell-incorrect';
            
            const tdResult = document.createElement('td');
            tdResult.textContent = (guess === emojiGameId) ? '✅ Correct' : '❌ Incorrect';
            tdResult.className = (guess === emojiGameId) ? 'cell-correct' : 'cell-incorrect';

            row.appendChild(tdName);
            row.appendChild(tdResult);
            emojiTbody.appendChild(row);
        });

        // Revela Emojis gradativamente
        const revealedCount = Math.min(emojiGuessedBosses.length + 1, 5);
        const correctEmojis = BOSS_EMOJIS[emojiGameId] || ['❓','❓','❓','❓','❓'];
        
        emojiBoxes.forEach((box, index) => {
            if (index < revealedCount || emojiIsGameOver) {
                box.textContent = correctEmojis[index];
                box.classList.add('revealed');
            } else {
                box.textContent = '❓';
                box.classList.remove('revealed');
            }
        });

        if (emojiIsGameOver) {
            emojiInputSearch.disabled = true;
            btnEmojiGuess.disabled = true;
        } else {
            emojiInputSearch.disabled = false;
            emojiInputSearch.value = '';
            btnEmojiGuess.disabled = true;
        }
    }

    function submitEmojiGuess(guessName) {
        if (emojiIsGameOver || emojiGuessedBosses.includes(guessName) || emojiGuessedBosses.length >= 5) return;

        emojiGuessedBosses.push(guessName);
        
        if (guessName === emojiGameId) {
            emojiIsGameOver = true;
            updateEmojiUI();
            saveEmojiSession();
            handleVictory(BOSS_DATABASE[emojiGameId], emojiGuessedBosses.length); // from app.js
        } else if (emojiGuessedBosses.length >= 5) {
            emojiIsGameOver = true;
            updateEmojiUI();
            saveEmojiSession();
            
            // Perdeu no limite de tentativas
            renderVictoryModal(BOSS_DATABASE[emojiGameId], emojiGuessedBosses.length);
            document.getElementById('victory-boss-details').innerHTML = `<strong>Game Over! You ran out of attempts!</strong><br>The secret boss was ${emojiGameId}.`;
            document.querySelector('.victory-title').textContent = "YOU DIED";
            document.querySelector('.victory-title').style.color = "#c91a25";
            setTimeout(() => { openModal(modalVictory); }, 1000);

        } else {
            updateEmojiUI();
            saveEmojiSession();
        }
    }

    // Autocomplete Logic (reusing app.js structure)
    emojiInputSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        emojiSuggestions.innerHTML = '';
        emojiSelectionIndex = -1;

        if (!query) {
            emojiSuggestions.style.display = 'none';
            btnEmojiGuess.disabled = true;
            return;
        }

        const filtered = allBosses.filter(name => 
            name.toLowerCase().includes(query.toLowerCase()) && 
            !emojiGuessedBosses.includes(name)
        );

        if (filtered.length === 0) {
            emojiSuggestions.style.display = 'none';
            btnEmojiGuess.disabled = true;
            return;
        }

        filtered.forEach((name, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            const bossImgUrl = getBossImageUrl(name);
            item.innerHTML = `
                <img class="suggestion-img" src="${bossImgUrl}" alt="${name}">
                <span class="suggestion-name">${name}</span>
            `;
            
            item.addEventListener('click', () => {
                emojiInputSearch.value = name;
                emojiSuggestions.style.display = 'none';
                btnEmojiGuess.disabled = false;
                emojiInputSearch.focus();
            });
            emojiSuggestions.appendChild(item);
        });

        emojiSuggestions.style.display = 'block';
        
        const matched = allBosses.find(name => name.toLowerCase() === query.toLowerCase());
        btnEmojiGuess.disabled = !matched || emojiGuessedBosses.includes(matched);
    });

    btnEmojiGuess.addEventListener('click', () => {
        const guessName = emojiInputSearch.value.trim();
        const matchedName = allBosses.find(name => name.toLowerCase() === guessName.toLowerCase());
        if (matchedName) {
            submitEmojiGuess(matchedName);
            emojiSuggestions.style.display = 'none';
        }
    });

    emojiInputSearch.addEventListener('keydown', (e) => {
        const items = emojiSuggestions.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
                emojiSelectionIndex = (emojiSelectionIndex + 1) % items.length;
                items.forEach(item => item.classList.remove('active'));
                const activeItem = items[emojiSelectionIndex];
                activeItem.classList.add('active');
                activeItem.scrollIntoView({ block: 'nearest' });
                emojiInputSearch.value = activeItem.querySelector('.suggestion-name').textContent;
                btnEmojiGuess.disabled = false;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
                emojiSelectionIndex = (emojiSelectionIndex - 1 + items.length) % items.length;
                items.forEach(item => item.classList.remove('active'));
                const activeItem = items[emojiSelectionIndex];
                activeItem.classList.add('active');
                activeItem.scrollIntoView({ block: 'nearest' });
                emojiInputSearch.value = activeItem.querySelector('.suggestion-name').textContent;
                btnEmojiGuess.disabled = false;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (emojiSelectionIndex > -1 && items.length > 0) {
                submitEmojiGuess(items[emojiSelectionIndex].querySelector('.suggestion-name').textContent);
            } else if (items.length > 0) {
                submitEmojiGuess(items[0].querySelector('.suggestion-name').textContent);
            } else {
                const guessName = emojiInputSearch.value.trim();
                const matchedName = allBosses.find(name => name.toLowerCase() === guessName.toLowerCase());
                if (matchedName) submitEmojiGuess(matchedName);
            }
            emojiSuggestions.style.display = 'none';
        } else if (e.key === 'Escape') {
            emojiSuggestions.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            emojiSuggestions.style.display = 'none';
        }
    });

    // Sobrescrevendo a função startNewGame para resetar as cores caso tenham mudado na derrota (YOU DIED)
    const originalStartNewGame = window.startNewGame;
    window.startNewGame = async function() {
        const vicTitle = document.querySelector('.victory-title');
        if(vicTitle) {
            vicTitle.textContent = "ENEMY FELLED";
            vicTitle.style.color = "#e0be5b";
        }
        if (originalStartNewGame) {
            await originalStartNewGame();
        }
    };

})();
