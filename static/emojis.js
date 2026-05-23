const BOSS_EMOJIS = {
    "Godrick the Grafted": [
        "🌳",
        "👤",
        "👑",
        "🦾",
        "🗡️"
    ],
    "Rennala, Queen of the Full Moon": [
        "💧",
        "👤",
        "👑",
        "🪄",
        "🗡️"
    ],
    "Starscourge Radahn": [
        "🔴",
        "👤",
        "👑",
        "☄️",
        "🗡️"
    ],
    "Rykard, Lord of Blasphemy": [
        "🌋",
        "🐍",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Morgott, the Omen King": [
        "🏰",
        "👿",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Fire Giant": [
        "❄️",
        "🦵",
        "👑",
        "🔥",
        "🗡️"
    ],
    "Maliketh, the Black Blade": [
        "🌪️",
        "🐺",
        "👑",
        "☠️",
        "🗡️"
    ],
    "Godfrey, First Elden Lord": [
        "🏰",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Radagon of the Golden Order": [
        "🏰",
        "👤",
        "👑",
        "✨",
        "🗡️"
    ],
    "Elden Beast": [
        "🏰",
        "🐺",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Malenia, Blade of Miquella": [
        "🌨️",
        "👤",
        "👑",
        "🦠",
        "🗡️"
    ],
    "Mohg, Lord of Blood": [
        "🌌",
        "👿",
        "👑",
        "🩸",
        "🗡️"
    ],
    "Hoarah Loux, Warrior": [
        "🏰",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Margit, the Fell Omen": [
        "🌳",
        "👿",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Grafted Scion": [
        "🌳",
        "🗿",
        "⚔️",
        "🦾",
        "🗡️"
    ],
    "Soldier of Godrick": [
        "🌳",
        "👤",
        "👑",
        "🦾",
        "🗡️"
    ],
    "Leonine Misbegotten": [
        "🌳",
        "🧟",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Tree Sentinel": [
        "🌳",
        "🗿",
        "🛡️",
        "✨",
        "🗡️"
    ],
    "Crucible Knight": [
        "🌳",
        "👤",
        "🛡️",
        "🪽",
        "🌙"
    ],
    "Demi-Human Chiefs": [
        "🌳",
        "🐒",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Pumpkin Head": [
        "🌳",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Flying Dragon Agheel": [
        "🌳",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Tibia Mariner": [
        "🌳",
        "💀",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Beastman of Farum Azula": [
        "🌳",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Night's Cavalry": [
        "🌳",
        "💀",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Bloodhound Knight Darriwil": [
        "🌳",
        "🐺",
        "🛡️",
        "🩸",
        "🌙"
    ],
    "Grave Warden Duelist": [
        "🌳",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Stonedigger Troll": [
        "🌳",
        "👹",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Patches": [
        "🌳",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Mad Pumpkin Head": [
        "🌳",
        "👤",
        "⚔️",
        "👁️",
        "🗡️"
    ],
    "Deathbird": [
        "🌳",
        "🦅",
        "⚔️",
        "☠️",
        "🗡️"
    ],
    "Bell Bearing Hunter": [
        "🌳",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Erdtree Burial Watchdog": [
        "🌳",
        "🗿",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Demi-Human Queen Gilika": [
        "🌳",
        "🐒",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Miranda the Blighted Bloom": [
        "🌳",
        "🌸",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Scaly Misbegotten": [
        "🌳",
        "🧟",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Bloodhound Knight": [
        "🌳",
        "🐺",
        "🛡️",
        "🩸",
        "🌙"
    ],
    "Red Wolf of Radagon": [
        "💧",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Royal Knight Loretta": [
        "💧",
        "👤",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Glintstone Dragon Smarag": [
        "💧",
        "🐲",
        "⚔️",
        "🪄",
        "🗡️"
    ],
    "Erdtree Avatar": [
        "💧",
        "🌲",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Adan, Thief of Fire": [
        "💧",
        "👤",
        "⚔️",
        "🔥",
        "🗡️"
    ],
    "Magma Wyrm Makar": [
        "💧",
        "🐲",
        "⚔️",
        "🔥",
        "🗡️"
    ],
    "Crystalian": [
        "💧",
        "🗿",
        "⚔️",
        "💎",
        "🗡️"
    ],
    "Bols, Carian Knight": [
        "💧",
        "👹",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Glintstone Dragon Adula": [
        "💧",
        "🐲",
        "⚔️",
        "🪄",
        "🗡️"
    ],
    "Spirit-Caller Snail": [
        "💧",
        "🐌",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Nox Swordstress & Nox Priest": [
        "💧",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Cemetery Shade": [
        "💧",
        "💀",
        "⚔️",
        "🌙",
        "🗡️"
    ],
    "Demi-Human Queen Maggie": [
        "💧",
        "🐒",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Tibia Mariner (Liurnia)": [
        "💧",
        "💀",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Omenkiller": [
        "💧",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Bloodhound Knight (Liurnia)": [
        "💧",
        "🐺",
        "🛡️",
        "🩸",
        "🌙"
    ],
    "Starscourge Radahn (Festival)": [
        "🔴",
        "👤",
        "👑",
        "☄️",
        "🗡️"
    ],
    "Commander O'Neil": [
        "🔴",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Putrid Avatar": [
        "🔴",
        "🌲",
        "⚔️",
        "🦠",
        "🗡️"
    ],
    "Battlemage Hugues": [
        "🔴",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Bell Bearing Hunter (Caelid)": [
        "🔴",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Cleanrot Knight": [
        "🔴",
        "👤",
        "🛡️",
        "🦠",
        "🌙"
    ],
    "Black Blade Kindred": [
        "🔴",
        "🗿",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Flying Dragon Greyll": [
        "🔴",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Nox Swordstress": [
        "🔴",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Death Rite Bird (Caelid)": [
        "🔴",
        "🦅",
        "⚔️",
        "☠️",
        "🗡️"
    ],
    "Putrid Crystalian Trio": [
        "🔴",
        "🗿",
        "⚔️",
        "🦠",
        "💎"
    ],
    "Putrid Tree Spirit": [
        "🔴",
        "🌲",
        "⚔️",
        "🦠",
        "✨"
    ],
    "Godskin Apostle (Dragonbarrow)": [
        "🔴",
        "⛪",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Godfrey, First Elden Lord (Golden Shade)": [
        "🏰",
        "👤",
        "👑",
        "🌙",
        "✨"
    ],
    "Elemer of the Briar": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Fallingstar Beast (Altus)": [
        "🗺️",
        "👤",
        "⚔️",
        "☄️",
        "🗡️"
    ],
    "Godskin Apostle (Altus)": [
        "🗺️",
        "⛪",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Ancient Dragon Lansseax": [
        "🗺️",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Draconic Tree Sentinel": [
        "🗺️",
        "🗿",
        "🛡️",
        "✨",
        "🗡️"
    ],
    "Omenkiller & Miranda the Blighted Bloom": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Crucible Knight Ordovis": [
        "🗺️",
        "👤",
        "🛡️",
        "🪽",
        "🌙"
    ],
    "Ancient Hero of Zamor": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Fell Twins": [
        "🗺️",
        "👤",
        "⚔️",
        "👯",
        "🗡️"
    ],
    "Onyx Lord": [
        "🗺️",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Sanguine Noble": [
        "🗺️",
        "👤",
        "⚔️",
        "🩸",
        "🗡️"
    ],
    "Wormface": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Perfumer Tricia": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Necromancer Garris": [
        "🗺️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Black Knife Assassin (Altus)": [
        "🗺️",
        "👤",
        "⚔️",
        "☠️",
        "🗡️"
    ],
    "Godefroy the Grafted": [
        "🗺️",
        "👤",
        "👑",
        "🦾",
        "🗡️"
    ],
    "Godskin Noble": [
        "🌋",
        "⛪",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Full-Grown Fallingstar Beast": [
        "🌋",
        "👤",
        "⚔️",
        "☄️",
        "🗡️"
    ],
    "Abductor Virgins": [
        "🌋",
        "🗿",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Magma Wyrm": [
        "🌋",
        "🐲",
        "⚔️",
        "🔥",
        "🗡️"
    ],
    "Red Wolf of the Champion": [
        "🌋",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ulcerated Tree Spirit (Gelmir)": [
        "🌋",
        "🌲",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Demi-Human Queen Margot": [
        "🌋",
        "🐒",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Kindred of Rot": [
        "🌋",
        "👤",
        "⚔️",
        "🦠",
        "🗡️"
    ],
    "Mohg, the Omen": [
        "🏰",
        "👿",
        "⚔️",
        "🩸",
        "🗡️"
    ],
    "Esgar, Priest of Blood": [
        "🏰",
        "👤",
        "⚔️",
        "🩸",
        "🗡️"
    ],
    "Sir Gideon Ofnir, the All-Knowing": [
        "🏰",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ancestor Spirit": [
        "🌌",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Dragonkin Soldier": [
        "🌌",
        "🐲",
        "🦕",
        "🗡️",
        "🐎"
    ],
    "Mimic Tear": [
        "🌌",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Regal Ancestor Spirit": [
        "🌌",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Valiant Gargoyle": [
        "🌌",
        "🗿",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Astel, Naturalborn of the Void": [
        "💧",
        "👤",
        "⚔️",
        "☄️",
        "🗡️"
    ],
    "Dragonkin Soldier of Nokstella": [
        "💧",
        "🐲",
        "🦕",
        "🗡️",
        "🐎"
    ],
    "Lichdragon Fortissax": [
        "🌌",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Crucible Knight Siluria": [
        "🌌",
        "👤",
        "🛡️",
        "🪽",
        "🌙"
    ],
    "Fia's Champions": [
        "🌌",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Borealis the Freezing Fog": [
        "❄️",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Commander Niall": [
        "❄️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Death Rite Bird": [
        "❄️",
        "🦅",
        "⚔️",
        "☠️",
        "🗡️"
    ],
    "Vyke, Knight of the Roundtable": [
        "❄️",
        "👤",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Ulcerated Tree Spirit (Mountaintops)": [
        "❄️",
        "🌲",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Ancient Hero of Zamor (Mountaintops)": [
        "❄️",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Great Wyrm Theodorix": [
        "🌨️",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Astel, Stars of Darkness": [
        "🌨️",
        "👤",
        "⚔️",
        "☄️",
        "🗡️"
    ],
    "Misbegotten Crusader": [
        "🌨️",
        "🧟",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Loretta, Knight of the Haligtree": [
        "🌨️",
        "👤",
        "🛡️",
        "🌙",
        "✨"
    ],
    "Putrid Grave Warden Duelist": [
        "🌨️",
        "👤",
        "⚔️",
        "🦠",
        "🗡️"
    ],
    "Night's Cavalry (Duo)": [
        "🌨️",
        "💀",
        "🛡️",
        "🌙",
        "👯"
    ],
    "Putrid Avatar (Snowfield)": [
        "🌨️",
        "🌲",
        "⚔️",
        "🦠",
        "🗡️"
    ],
    "Dragonlord Placidusax": [
        "🌪️",
        "🐲",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Godskin Duo": [
        "🌪️",
        "⛪",
        "👑",
        "👯",
        "🗡️"
    ],
    "Crucible Knight Evergaol": [
        "🌳",
        "👤",
        "🛡️",
        "🪽",
        "🌙"
    ],
    "Elden Ring's Black Knife Assassin": [
        "🌳",
        "👤",
        "⚔️",
        "☠️",
        "🗡️"
    ],
    "Misbegotten Warrior": [
        "🔴",
        "🧟",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Crucible Knight (Redmane)": [
        "🔴",
        "👤",
        "🛡️",
        "🪽",
        "🌙"
    ],
    "Divine Beast Dancing Lion": [
        "🪦",
        "🐺",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Rellana, Twin Moon Knight": [
        "🪦",
        "👤",
        "👑",
        "🪄",
        "🌙"
    ],
    "Commander Gaius": [
        "🪦",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Messmer the Impaler": [
        "🪦",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Scadutree Avatar": [
        "🪦",
        "🌸",
        "👑",
        "✨",
        "🗡️"
    ],
    "Putrescent Knight": [
        "🪦",
        "💀",
        "👑",
        "🌙",
        "🗡️"
    ],
    "Romina, Saint of the Bud": [
        "🪦",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Midra, Lord of Frenzied Flame": [
        "🪦",
        "👤",
        "👑",
        "🔥",
        "👁️"
    ],
    "Metyr, Mother of Fingers": [
        "🪦",
        "👤",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Bayle the Dread": [
        "🪦",
        "🐲",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Promised Consort Radahn": [
        "🪦",
        "👤",
        "👑",
        "☄️",
        "🗡️"
    ],
    "Blackgaol Knight": [
        "🪦",
        "👤",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Ghostflame Dragon": [
        "🪦",
        "🐲",
        "⚔️",
        "🔥",
        "🗡️"
    ],
    "Demi-Human Queen Marigga": [
        "🪦",
        "🐒",
        "👑",
        "🗡️",
        "🐎"
    ],
    "Furnace Golem": [
        "🪦",
        "🗿",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Golden Hippopotamus": [
        "🪦",
        "🐺",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Rakshasa": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Black Knight Garrew": [
        "🪦",
        "👤",
        "🛡️",
        "🌙",
        "🗡️"
    ],
    "Rugalea the Great Red Bear": [
        "🪦",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Death Knight": [
        "🪦",
        "💀",
        "🛡️",
        "☠️",
        "🌙"
    ],
    "Jori, Elder Inquisitor": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Lamenter": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Dancer of Ranah": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ralva the Great Red Bear": [
        "🪦",
        "🐺",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Jagged Peak Drake": [
        "🪦",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ghostflame Dragon (Jagged Peak)": [
        "🪦",
        "🐲",
        "⚔️",
        "🔥",
        "🗡️"
    ],
    "Demi-Human Swordmaster Onze": [
        "🪦",
        "🐒",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Curseblade Labirith": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Tree Spirit of Fissure": [
        "🪦",
        "🌲",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Messmer Soldier (Evergaol)": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Sunflower": [
        "🪦",
        "🌸",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ancient Dragon Senessax": [
        "🪦",
        "🐲",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Bloodfiend Crucible": [
        "🪦",
        "👤",
        "⚔️",
        "🩸",
        "🪽"
    ],
    "Romina's Phantom": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Gravebird": [
        "🪦",
        "🦅",
        "⚔️",
        "🗡️",
        "🐎"
    ],
    "Ulcerated Tree Spirit (DLC)": [
        "🪦",
        "🌲",
        "⚔️",
        "✨",
        "🗡️"
    ],
    "Fingercreeper (Shadow Keep)": [
        "🪦",
        "👤",
        "⚔️",
        "🗡️",
        "🐎"
    ]
};
