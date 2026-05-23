// Eldendle Achievements & Share System

const ACHIEVEMENTS_DB = [
    { id: 'first_blood', icon: '🩸', title: 'First Blood', desc: 'Complete your first game.' },
    { id: 'first_try', icon: '🎯', title: 'First Try', desc: 'Guess a boss on the very first attempt.' },
    { id: 'elden_lord', icon: '👑', title: 'Elden Lord', desc: 'Win 10 games.' },
    { id: 'perfect_week', icon: '📅', title: 'Perfect Week', desc: 'Reach a streak of 7 wins.' },
    { id: 'scholar', icon: '📚', title: 'Scholar', desc: 'Use a hint and still guess correctly.' }
];

function getAchievements() {
    const defaultAch = [];
    return JSON.parse(localStorage.getItem('eldendle_achievements')) || defaultAch;
}

function saveAchievements(achs) {
    localStorage.setItem('eldendle_achievements', JSON.stringify(achs));
}

function renderAchievementsModal() {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    
    const unlocked = getAchievements();
    list.innerHTML = '';
    
    ACHIEVEMENTS_DB.forEach(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        const el = document.createElement('div');
        el.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
        el.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-details">
                <h4>${ach.title}</h4>
                <p>${ach.desc}</p>
            </div>
        `;
        list.appendChild(el);
    });
}

function showToast(icon, title, desc) {
    let toast = document.getElementById('achievement-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'achievement-toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>Achievement Unlocked!</h4>
            <p>${title}</p>
        </div>
    `;
    
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function checkAchievements(stats, attempts, usedHint = false) {
    const unlocked = getAchievements();
    const newUnlocks = [];
    
    function unlock(id) {
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            newUnlocks.push(id);
        }
    }
    
    if (stats.played >= 1) unlock('first_blood');
    if (attempts === 1) unlock('first_try');
    if (stats.won >= 10) unlock('elden_lord');
    if (stats.streak >= 7) unlock('perfect_week');
    if (usedHint) unlock('scholar');
    
    if (newUnlocks.length > 0) {
        saveAchievements(unlocked);
        // Show toast for the first new unlock (or all via loop, but one is cleaner for UI)
        const achInfo = ACHIEVEMENTS_DB.find(a => a.id === newUnlocks[0]);
        if (achInfo) {
            showToast(achInfo.icon, achInfo.title, achInfo.desc);
        }
        renderAchievementsModal();
    }
}

// --------------------------------------------------------------------------
// SHARE SYSTEM
// --------------------------------------------------------------------------

function generateShareText() {
    // Determine which mode we are in based on active tab
    const isClassic = document.getElementById('tab-classic').classList.contains('active');
    const isEmoji = document.getElementById('tab-emoji').classList.contains('active');
    const isImage = document.getElementById('tab-image').classList.contains('active');
    
    const isDaily = document.getElementById('mode-daily').checked;
    const modeName = isDaily ? 'Daily' : 'Endless';
    const dateStr = isDaily ? ` - ${new Date().toLocaleDateString()}` : '';

    let text = \`Eldendle (\${modeName}\${dateStr})\\n\`;

    if (isClassic) {
        // Build classic share based on guessedBosses
        const attempts = document.getElementById('victory-attempts').textContent;
        text += \`📜 Classic: \${attempts}/8\\n\\n\`;
        
        // We need to fetch the session state. It's stored in app.js global variables, 
        // but since they might be encapsulated, we can read localStorage or DOM directly!
        const rows = document.querySelectorAll('#guess-tbody .guess-row');
        rows.forEach(row => {
            const cells = row.querySelectorAll('.guess-cell');
            cells.forEach(cell => {
                if (cell.classList.contains('correct')) text += '🟩';
                else if (cell.classList.contains('partial')) text += '🟨';
                else if (cell.classList.contains('incorrect')) text += '🟥';
            });
            text += '\\n';
        });
    } 
    else if (isEmoji) {
        const attempts = document.getElementById('victory-attempts').textContent;
        text += \`🗿 Emoji Guess: \${attempts}/5\\n\\n\`;
        
        const count = parseInt(attempts) || 1;
        for(let i=0; i<count-1; i++) text += '🗿';
        text += '🟩\\n';
    } 
    else if (isImage) {
        const attempts = document.getElementById('victory-attempts').textContent;
        text += \`🖼️ Image Guess: \${attempts} attempts\\n\\n\`;
        
        const count = parseInt(attempts) || 1;
        for(let i=0; i<Math.min(count-1, 5); i++) text += '🔍';
        if(count > 6) text += '+ ';
        text += '✅\\n';
    }
    
    text += \`\\nhttps://nathanscremin.github.io/Eldendle/\`;
    
    return text;
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup achievements modal
    const btnAch = document.getElementById('btn-achievements');
    const modalAch = document.getElementById('modal-achievements');
    
    if (btnAch && modalAch) {
        btnAch.addEventListener('click', () => {
            renderAchievementsModal();
            modalAch.style.display = 'flex';
        });
        
        const closeBtn = modalAch.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => modalAch.style.display = 'none');
    }
    
    // Setup Share Button
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const text = generateShareText();
            const originalHtml = btnShare.innerHTML;
            
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Eldendle Result',
                        text: text
                    });
                } else {
                    await navigator.clipboard.writeText(text);
                    btnShare.innerHTML = 'Copied! ✅';
                    setTimeout(() => { btnShare.innerHTML = originalHtml; }, 2000);
                }
            } catch (err) {
                console.error('Failed to share:', err);
                // Fallback to clipboard
                try {
                    await navigator.clipboard.writeText(text);
                    btnShare.innerHTML = 'Copied! ✅';
                    setTimeout(() => { btnShare.innerHTML = originalHtml; }, 2000);
                } catch(e) {}
            }
        });
    }
});
