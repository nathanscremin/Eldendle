/**
 * ==========================================================================
 * ELDENDLE - IMAGE MODE (PARTE 3)
 * ==========================================================================
 */

(function() {
    let imgGameId = null;
    let imgGuessedBosses = [];
    let imgIsGameOver = false;
    let imgOriginX = 50;
    let imgOriginY = 50;
    let validImageBosses = [];

    const imgInputSearch = document.getElementById('image-boss-search');
    const imgSuggestions = document.getElementById('image-suggestions');
    const btnImgGuess = document.getElementById('btn-image-guess');
    const imgAttemptsEl = document.getElementById('image-attempts-count');
    const imgTbody = document.getElementById('image-guess-tbody');
    const imgEmptyState = document.getElementById('image-empty-state');
    const bossZoomImage = document.getElementById('boss-zoom-image');

    let imgSelectionIndex = -1;

    // Constroi a lista de bosses que possuem imagens válidas (não usam o fallback)
    function buildValidBossesList() {
        validImageBosses = Object.keys(BOSS_DATABASE).filter(bossName => {
            const boss = BOSS_DATABASE[bossName];
            // "Demi-Human Chiefs" é o dono original da imagem de fallback
            if (bossName === "Demi-Human Chiefs") return true;
            return !boss.image_url.includes("Demi-Human_Chiefs.jpg");
        });
    }

    // Gera um número pseudo-aleatório (0 a 1) com base numa semente (string)
    function seededRandom(seedStr) {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    }

    function getImageDailyBossKey() {
        const dateStr = getCurrentDateKey() + "_image";
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
            hash |= 0; 
        }
        const index = Math.abs(hash) % validImageBosses.length;
        return validImageBosses[index];
    }

    function generateTransformOrigin(seed) {
        // Gera X e Y entre 20% e 80%
        let randX, randY;
        if (seed) {
            randX = 20 + (seededRandom(seed + "_X") * 60);
            randY = 20 + (seededRandom(seed + "_Y") * 60);
        } else {
            randX = 20 + (Math.random() * 60);
            randY = 20 + (Math.random() * 60);
        }
        imgOriginX = randX.toFixed(2);
        imgOriginY = randY.toFixed(2);
    }

    function saveImageSession() {
        if (!imgGameId) return;
        const sessionKey = currentMode === 'daily' ? `eldendle_img_daily_${getCurrentDateKey()}` : 'eldendle_img_endless';
        localStorage.setItem(sessionKey, JSON.stringify({
            gameId: imgGameId,
            guessedBosses: imgGuessedBosses,
            isGameOver: imgIsGameOver,
            originX: imgOriginX,
            originY: imgOriginY
        }));
    }

    window.imageRestoreSession = async function() {
        if (allBosses.length === 0) await loadBossList(); // from app.js
        if (validImageBosses.length === 0) buildValidBossesList();

        const sessionKey = currentMode === 'daily' ? `eldendle_img_daily_${getCurrentDateKey()}` : 'eldendle_img_endless';
        const sessionDataStr = localStorage.getItem(sessionKey);
        
        if (!sessionDataStr) {
            await imageStartNewGame();
            return;
        }

        try {
            const session = JSON.parse(sessionDataStr);
            imgGameId = session.gameId;
            imgGuessedBosses = session.guessedBosses || [];
            imgIsGameOver = session.isGameOver || false;
            imgOriginX = session.originX || 50;
            imgOriginY = session.originY || 50;

            updateImageUI();

            if (imgIsGameOver) {
                renderVictoryModal(BOSS_DATABASE[imgGameId], imgGuessedBosses.length);
            }
        } catch (e) {
            localStorage.removeItem(sessionKey);
            await imageStartNewGame();
        }
    };

    window.imageStartNewGame = async function() {
        if (validImageBosses.length === 0) buildValidBossesList();

        imgIsGameOver = false;
        imgGuessedBosses = [];
        
        const sessionKey = currentMode === 'daily' ? `eldendle_img_daily_${getCurrentDateKey()}` : 'eldendle_img_endless';
        localStorage.removeItem(sessionKey);

        if (currentMode === 'daily') {
            imgGameId = getImageDailyBossKey();
            generateTransformOrigin(getCurrentDateKey() + "_image_origin");
        } else {
            imgGameId = validImageBosses[Math.floor(Math.random() * validImageBosses.length)];
            generateTransformOrigin(null); // Random
        }

        const vicTitle = document.querySelector('.victory-title');
        if(vicTitle) {
            vicTitle.textContent = "ENEMY FELLED";
            vicTitle.style.color = "#e0be5b";
        }

        updateImageUI();
    }

    function updateImageUI() {
        imgTbody.innerHTML = '';
        imgAttemptsEl.textContent = imgGuessedBosses.length;

        if (imgGuessedBosses.length > 0) {
            imgEmptyState.style.display = 'none';
        } else {
            imgEmptyState.style.display = 'block';
        }

        const reversedGuesses = [...imgGuessedBosses].reverse();
        reversedGuesses.forEach(guess => {
            const row = document.createElement('tr');
            row.className = 'guess-row';
            
            const tdName = document.createElement('td');
            tdName.textContent = guess;
            tdName.className = (guess === imgGameId) ? 'cell-correct' : 'cell-incorrect';
            
            const tdResult = document.createElement('td');
            tdResult.textContent = (guess === imgGameId) ? '✅ Correct' : '❌ Incorrect';
            tdResult.className = (guess === imgGameId) ? 'cell-correct' : 'cell-incorrect';

            row.appendChild(tdName);
            row.appendChild(tdResult);
            imgTbody.appendChild(row);
        });

        // Atualiza a Imagem e o Zoom
        bossZoomImage.src = getBossImageUrl(imgGameId);
        bossZoomImage.onload = () => {
            bossZoomImage.classList.add('loaded');
        };

        let zoomLevel = 1.0;
        if (!imgIsGameOver) {
            // Tentativas infinitas. O zoom desce de 3.5 até 1.0 (na 10ª tentativa)
            // 3.5 - (tentativas * 0.25)
            zoomLevel = Math.max(1.0, 3.5 - (imgGuessedBosses.length * 0.25));
        }

        bossZoomImage.style.transformOrigin = `${imgOriginX}% ${imgOriginY}%`;
        bossZoomImage.style.transform = `scale(${zoomLevel})`;

        if (imgIsGameOver) {
            imgInputSearch.disabled = true;
            btnImgGuess.disabled = true;
        } else {
            imgInputSearch.disabled = false;
            imgInputSearch.value = '';
            btnImgGuess.disabled = true;
        }
    }

    function submitImageGuess(guessName) {
        if (imgIsGameOver || imgGuessedBosses.includes(guessName)) return;

        imgGuessedBosses.push(guessName);
        
        if (guessName === imgGameId) {
            imgIsGameOver = true;
            updateImageUI();
            saveImageSession();
            handleVictory(BOSS_DATABASE[imgGameId], imgGuessedBosses.length); // from app.js
        } else {
            updateImageUI();
            saveImageSession();
        }
    }

    // Autocomplete Logic
    imgInputSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        imgSuggestions.innerHTML = '';
        imgSelectionIndex = -1;

        if (!query) {
            imgSuggestions.style.display = 'none';
            btnImgGuess.disabled = true;
            return;
        }

        const filtered = allBosses.filter(name => 
            name.toLowerCase().includes(query.toLowerCase()) && 
            !imgGuessedBosses.includes(name)
        );

        if (filtered.length === 0) {
            imgSuggestions.style.display = 'none';
            btnImgGuess.disabled = true;
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
                imgInputSearch.value = name;
                imgSuggestions.style.display = 'none';
                btnImgGuess.disabled = false;
                imgInputSearch.focus();
            });
            imgSuggestions.appendChild(item);
        });

        imgSuggestions.style.display = 'block';
        
        const matched = allBosses.find(name => name.toLowerCase() === query.toLowerCase());
        btnImgGuess.disabled = !matched || imgGuessedBosses.includes(matched);
    });

    btnImgGuess.addEventListener('click', () => {
        const guessName = imgInputSearch.value.trim();
        const matchedName = allBosses.find(name => name.toLowerCase() === guessName.toLowerCase());
        if (matchedName) {
            submitImageGuess(matchedName);
            imgSuggestions.style.display = 'none';
        }
    });

    imgInputSearch.addEventListener('keydown', (e) => {
        const items = imgSuggestions.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
                imgSelectionIndex = (imgSelectionIndex + 1) % items.length;
                items.forEach(item => item.classList.remove('active'));
                const activeItem = items[imgSelectionIndex];
                activeItem.classList.add('active');
                activeItem.scrollIntoView({ block: 'nearest' });
                imgInputSearch.value = activeItem.querySelector('.suggestion-name').textContent;
                btnImgGuess.disabled = false;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
                imgSelectionIndex = (imgSelectionIndex - 1 + items.length) % items.length;
                items.forEach(item => item.classList.remove('active'));
                const activeItem = items[imgSelectionIndex];
                activeItem.classList.add('active');
                activeItem.scrollIntoView({ block: 'nearest' });
                imgInputSearch.value = activeItem.querySelector('.suggestion-name').textContent;
                btnImgGuess.disabled = false;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (imgSelectionIndex > -1 && items.length > 0) {
                submitImageGuess(items[imgSelectionIndex].querySelector('.suggestion-name').textContent);
            } else if (items.length > 0) {
                submitImageGuess(items[0].querySelector('.suggestion-name').textContent);
            } else {
                const guessName = imgInputSearch.value.trim();
                const matchedName = allBosses.find(name => name.toLowerCase() === guessName.toLowerCase());
                if (matchedName) submitImageGuess(matchedName);
            }
            imgSuggestions.style.display = 'none';
        } else if (e.key === 'Escape') {
            imgSuggestions.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            imgSuggestions.style.display = 'none';
        }
    });

})();
