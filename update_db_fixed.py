import os

path = r'server/app/database.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

reps = {
    '"nome":': '"name":',
    '"regiao":': '"region":',
    '"fase":': '"phase":',
    '"tipo":': '"type":',
    '"raca":': '"race":',
    '"localizacao_especifica":': '"specific_location":',
    '"drop_principal":': '"main_drop":',
    '"obrigatorio":': '"mandatory":',
    '"imagem_url":': '"image_url":'
}

for k, v in reps.items():
    text = text.replace(k, v)

# Add DLC property
lines = text.split('\n')
new_lines = []
for line in lines:
    new_lines.append(line)
    if '"mandatory":' in line:
        new_lines.append(line.replace('"mandatory"', '"dlc"').replace('True', 'False'))

text = '\n'.join(new_lines)

dlc_bosses = [
    "Divine Beast Dancing Lion",
    "Rellana, Twin Moon Knight",
    "Messmer the Impaler",
    "Promised Consort Radahn",
    "Romina, Saint of the Bud",
    "Midra, Lord of Frenzied Flame",
    "Bayle the Dread",
    "Putrescent Knight",
    "Commander Gaius",
    "Scadutree Avatar"
]

for boss in dlc_bosses:
    boss_block = f'"{boss}": {{'
    if boss_block in text:
        start_idx = text.find(boss_block)
        end_idx = text.find('},', start_idx)
        block = text[start_idx:end_idx]
        new_block = block.replace('"dlc": False', '"dlc": True')
        text = text.replace(block, new_block)

new_bosses = """    "Metyr, Mother of Fingers": {
        "name": "Metyr, Mother of Fingers",
        "region": "Scadu Altus",
        "phase": 2,
        "type": "Legend",
        "race": "Malformed Star",
        "specific_location": "Finger Ruins of Miyr",
        "main_drop": "Remembrance of the Mother of Fingers",
        "mandatory": False,
        "dlc": True,
        "runes": 420000,
        "image_url": "https://eldenring.wiki.fextralife.com/file/Elden-Ring/metyr_mother_of_fingers_bosses_elden_ring_wiki_guide_200px.jpg"
    },
    "Count Ymir, Mother of Fingers": {
        "name": "Count Ymir, Mother of Fingers",
        "region": "Scadu Altus",
        "phase": 1,
        "type": "Great Enemy",
        "race": "Humanoid",
        "specific_location": "Cathedral of Manus Metyr",
        "main_drop": "Maternal Staff",
        "mandatory": False,
        "dlc": True,
        "runes": 120000,
        "image_url": "https://eldenring.wiki.fextralife.com/file/Elden-Ring/count_ymir_mother_of_fingers_bosses_elden_ring_wiki_guide_200px.jpg"
    },
    "Death Knight": {
        "name": "Death Knight",
        "region": "Scadu Altus",
        "phase": 1,
        "type": "Great Enemy",
        "race": "Humanoid",
        "specific_location": "Fog Rift Catacombs",
        "main_drop": "Death Knight's Twin Axes",
        "mandatory": False,
        "dlc": True,
        "runes": 110000,
        "image_url": "https://eldenring.wiki.fextralife.com/file/Elden-Ring/death_knight_bosses_elden_ring_wiki_guide_200px.jpg"
    },
    "Blackgaol Knight": {
        "name": "Blackgaol Knight",
        "region": "Gravesite Plain",
        "phase": 1,
        "type": "Great Enemy",
        "race": "Humanoid",
        "specific_location": "Western Nameless Mausoleum",
        "main_drop": "Greatsword of Solitude",
        "mandatory": False,
        "dlc": True,
        "runes": 70000,
        "image_url": "https://eldenring.wiki.fextralife.com/file/Elden-Ring/blackgaol_knight_bosses_elden_ring_wiki_guide_200px.jpg"
    },
    "Death Rite Bird (Charo's Hidden Grave)": {
        "name": "Death Rite Bird (Charo's Hidden Grave)",
        "region": "Gravesite Plain",
        "phase": 1,
        "type": "Great Enemy",
        "race": "Spirit",
        "specific_location": "Charo's Hidden Grave",
        "main_drop": "Ash of War: Ghostflame Call",
        "mandatory": False,
        "dlc": True,
        "runes": 140000,
        "image_url": "https://eldenring.wiki.fextralife.com/file/Elden-Ring/death_rite_bird_bosses_elden_ring_wiki_guide_200px.jpg"
    },
}"""

# Find the LAST '}' character and replace it with the new bosses
last_brace_idx = text.rfind('}')
if last_brace_idx != -1:
    text = text[:last_brace_idx] + new_bosses + text[last_brace_idx+1:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
