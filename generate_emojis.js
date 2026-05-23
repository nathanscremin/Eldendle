const fs = require('fs');

// Ler o database original e extrair o objeto
let dbContent = fs.readFileSync('./static/database.js', 'utf-8');
// Remover "const BOSS_DATABASE = "
dbContent = dbContent.replace('const BOSS_DATABASE = ', '').trim();
if (dbContent.endsWith(';')) dbContent = dbContent.slice(0, -1);

const BOSS_DATABASE = JSON.parse(dbContent);

const BOSS_EMOJIS = {};

for (const key in BOSS_DATABASE) {
    const boss = BOSS_DATABASE[key];
    const emojis = [];

    const nameStr = boss.name.toLowerCase();
    const regionStr = boss.region.toLowerCase();
    const raceStr = boss.race.toLowerCase();
    const typeStr = boss.type.toLowerCase();

    // 1. REGION EMOJI
    if (regionStr.includes('limgrave')) emojis.push('🌳');
    else if (regionStr.includes('liurnia')) emojis.push('💧');
    else if (regionStr.includes('caelid')) emojis.push('🔴');
    else if (regionStr.includes('leyndell')) emojis.push('🏰');
    else if (regionStr.includes('mountaintops')) emojis.push('❄️');
    else if (regionStr.includes('farum azula')) emojis.push('🌪️');
    else if (regionStr.includes('snowfield')) emojis.push('🌨️');
    else if (regionStr.includes('gelmir') || regionStr.includes('volcano')) emojis.push('🌋');
    else if (regionStr.includes('siofra') || regionStr.includes('nokron') || regionStr.includes('nokstella') || regionStr.includes('underground')) emojis.push('🌌');
    else if (regionStr.includes('weeping')) emojis.push('☔');
    else if (regionStr.includes('haligtree')) emojis.push('🌿');
    else if (boss.dlc) emojis.push('🪦');
    else emojis.push('🗺️');

    // 2. RACE EMOJI
    if (raceStr.includes('dragon')) emojis.push('🐲');
    else if (raceStr.includes('beast') || nameStr.includes('hound') || nameStr.includes('wolf')) emojis.push('🐺');
    else if (raceStr.includes('serpent')) emojis.push('🐍');
    else if (raceStr.includes('omen')) emojis.push('👿');
    else if (raceStr.includes('giant')) emojis.push('🦵');
    else if (raceStr.includes('undead') || raceStr.includes('skeleton')) emojis.push('💀');
    else if (raceStr.includes('construct') || raceStr.includes('gargoyle') || raceStr.includes('golem')) emojis.push('🗿');
    else if (raceStr.includes('troll')) emojis.push('👹');
    else if (raceStr.includes('bird')) emojis.push('🦅');
    else if (raceStr.includes('plant') || raceStr.includes('flower')) emojis.push('🌸');
    else if (raceStr.includes('godskin')) emojis.push('⛪');
    else if (raceStr.includes('tree avatar') || raceStr.includes('tree spirit')) emojis.push('🌲');
    else if (raceStr.includes('demi-human')) emojis.push('🐒');
    else if (raceStr.includes('misbegotten')) emojis.push('🧟');
    else if (raceStr.includes('bear')) emojis.push('🐻');
    else if (raceStr.includes('hippo')) emojis.push('🦛');
    else if (raceStr.includes('snail')) emojis.push('🐌');
    else if (raceStr.includes('alien') || raceStr.includes('astel') || raceStr.includes('fallingstar')) emojis.push('👾');
    else emojis.push('👤'); // Humanoid default

    // 3. TYPE/LORE EMOJI
    if (typeStr.includes('legend') || typeStr.includes('demigod') || nameStr.includes('god')) emojis.push('👑');
    else if (nameStr.includes('knight') || nameStr.includes('sentinel') || nameStr.includes('cavalry')) emojis.push('🛡️');
    else if (nameStr.includes('queen') || nameStr.includes('king') || nameStr.includes('lord')) emojis.push('👑');
    else if (nameStr.includes('dragonkin')) emojis.push('🦕');
    else emojis.push('⚔️');

    // 4 & 5. THEME / ELEMENT EMOJIS (2 traits)
    let added = 0;
    
    // Theme Checks
    if (nameStr.includes('fire') || nameStr.includes('magma') || nameStr.includes('flame')) { emojis.push('🔥'); added++; }
    if (nameStr.includes('blood') || nameStr.includes('mohg') || nameStr.includes('sanguine')) { emojis.push('🩸'); added++; }
    if (nameStr.includes('rot') || nameStr.includes('malenia') || nameStr.includes('putrid')) { emojis.push('🦠'); added++; }
    if (nameStr.includes('magic') || nameStr.includes('glintstone') || nameStr.includes('moon') || nameStr.includes('rennala')) { emojis.push('🪄'); added++; }
    if (nameStr.includes('death') || nameStr.includes('black knife') || nameStr.includes('mali')) { emojis.push('☠️'); added++; }
    if (nameStr.includes('star') || nameStr.includes('astel') || nameStr.includes('radahn')) { emojis.push('☄️'); added++; }
    if (nameStr.includes('crucible')) { emojis.push('🪽'); added++; }
    if (nameStr.includes('night') || nameStr.includes('shade')) { emojis.push('🌙'); added++; }
    if (nameStr.includes('golden') || nameStr.includes('tree') || nameStr.includes('erdtree')) { emojis.push('✨'); added++; }
    if (nameStr.includes('crystal')) { emojis.push('💎'); added++; }
    if (nameStr.includes('grafted') || nameStr.includes('godrick')) { emojis.push('🦾'); added++; }
    if (nameStr.includes('frenz') || nameStr.includes('mad')) { emojis.push('👁️'); added++; }
    if (nameStr.includes('twins') || nameStr.includes('duo')) { emojis.push('👯'); added++; }
    
    // Fallbacks to fill up to 5 emojis
    const fallbacks = ['🗡️', '🐎', '💥', '👻', '🌪️', '🦇'];
    let fIndex = 0;
    while (emojis.length < 5 && fIndex < fallbacks.length) {
        if (!emojis.includes(fallbacks[fIndex])) {
            emojis.push(fallbacks[fIndex]);
        }
        fIndex++;
    }
    
    // Trim to exactly 5
    BOSS_EMOJIS[key] = emojis.slice(0, 5);
}

const outStr = "const BOSS_EMOJIS = " + JSON.stringify(BOSS_EMOJIS, null, 4) + ";\n";
fs.writeFileSync('./static/emojis.js', outStr);
console.log("Emojis regerados logicamente!");
