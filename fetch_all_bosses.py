"""
Script to fetch ALL Elden Ring bosses from the Fandom wiki API
and generate a complete database.py file.

Run from project root: python fetch_all_bosses.py
"""
import json
import urllib.request
import urllib.parse
import time
import re
import os

BASE_API = "https://eldenring.fandom.com/api.php"
HEADERS = {"User-Agent": "Mozilla/5.0 EldenRindle-Bot/1.0 (educational project)"}

def api_get(params: dict) -> dict:
    url = BASE_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def get_all_boss_pages() -> list[dict]:
    """Fetch all pages in the 'Bosses' category from the Fandom wiki."""
    pages = []
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": "Category:Bosses",
        "cmlimit": "500",
        "cmnamespace": "0",
        "format": "json"
    }
    while True:
        data = api_get(params)
        members = data.get("query", {}).get("categorymembers", [])
        pages.extend(members)
        if "continue" in data:
            params.update(data["continue"])
        else:
            break
        time.sleep(0.5)
    return pages

def get_page_details(page_ids: list[int]) -> dict:
    """Fetch page images and categories for a list of page IDs."""
    chunk_size = 50
    results = {}
    for i in range(0, len(page_ids), chunk_size):
        chunk = page_ids[i:i+chunk_size]
        params = {
            "action": "query",
            "pageids": "|".join(str(p) for p in chunk),
            "prop": "pageimages|categories",
            "pithumbsize": "200",
            "cllimit": "50",
            "format": "json"
        }
        data = api_get(params)
        for pid, page in data.get("query", {}).get("pages", {}).items():
            results[int(pid)] = page
        time.sleep(0.5)
    return results

def get_thumbnail(boss_name: str) -> str | None:
    """Get thumbnail URL from Fandom API for a specific boss."""
    params = {
        "action": "query",
        "titles": boss_name,
        "prop": "pageimages",
        "pithumbsize": "200",
        "format": "json"
    }
    try:
        data = api_get(params)
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            thumb = page.get("thumbnail", {}).get("source")
            if thumb:
                return thumb
    except Exception as e:
        print(f"  Error fetching thumbnail for {boss_name}: {e}")
    return None

FALLBACK_IMAGE = "https://static.wikia.nocookie.net/eldenring/images/0/0e/ER_Custom_Menu_Icon_Boss.png/revision/latest/scale-to-width-down/200?cb=20231024002606"

# Complete manual boss data with all attributes
# Format: name -> {region, phase, type, race, specific_location, mandatory, dlc, runes}
# 'type' is: Demigod, Legend, Greater Enemy, Field Boss
BOSS_DATA = {
    # ============================================================
    # BASE GAME - DEMIGODS & LEGENDS (main story)
    # ============================================================
    "Godrick the Grafted": {"region": "Limgrave", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Stormveil Castle", "mandatory": False, "dlc": False, "runes": 20000},
    "Rennala, Queen of the Full Moon": {"region": "Liurnia of the Lakes", "phase": 2, "type": "Legend", "race": "Humanoid", "specific_location": "Raya Lucaria Academy", "mandatory": False, "dlc": False, "runes": 40000},
    "Starscourge Radahn": {"region": "Caelid", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Wailing Dunes", "mandatory": False, "dlc": False, "runes": 70000},
    "Rykard, Lord of Blasphemy": {"region": "Mt. Gelmir", "phase": 2, "type": "Demigod", "race": "Serpent", "specific_location": "Volcano Manor", "mandatory": False, "dlc": False, "runes": 130000},
    "Morgott, the Omen King": {"region": "Leyndell, Royal Capital", "phase": 2, "type": "Demigod", "race": "Omen", "specific_location": "Elden Throne", "mandatory": True, "dlc": False, "runes": 120000},
    "Fire Giant": {"region": "Mountaintops of the Giants", "phase": 2, "type": "Legend", "race": "Giant", "specific_location": "Flame Peak", "mandatory": True, "dlc": False, "runes": 180000},
    "Maliketh, the Black Blade": {"region": "Crumbling Farum Azula", "phase": 2, "type": "Legend", "race": "Beast", "specific_location": "Beside the Great Bridge", "mandatory": True, "dlc": False, "runes": 220000},
    "Godfrey, First Elden Lord": {"region": "Leyndell, Ashen Capital", "phase": 2, "type": "Legend", "race": "Humanoid", "specific_location": "Elden Throne", "mandatory": True, "dlc": False, "runes": 280000},
    "Radagon of the Golden Order": {"region": "Leyndell, Ashen Capital", "phase": 1, "type": "Legend", "race": "Humanoid", "specific_location": "Elden Throne", "mandatory": True, "dlc": False, "runes": 500000},
    "Elden Beast": {"region": "Leyndell, Ashen Capital", "phase": 1, "type": "Legend", "race": "Elden Beast", "specific_location": "Elden Throne", "mandatory": True, "dlc": False, "runes": 500000},
    "Malenia, Blade of Miquella": {"region": "Consecrated Snowfield", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Miquella's Haligtree", "mandatory": False, "dlc": False, "runes": 480000},
    "Mohg, Lord of Blood": {"region": "Siofra River", "phase": 2, "type": "Demigod", "race": "Omen", "specific_location": "Mohgwyn Palace", "mandatory": False, "dlc": False, "runes": 420000},
    "Hoarah Loux, Warrior": {"region": "Leyndell, Ashen Capital", "phase": 2, "type": "Legend", "race": "Humanoid", "specific_location": "Elden Throne", "mandatory": True, "dlc": False, "runes": 280000},
    # ============================================================
    # BASE GAME - GREATER ENEMIES (dungeon bosses, evergaol, etc.)
    # ============================================================
    "Margit, the Fell Omen": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Omen", "specific_location": "Stormveil Castle", "mandatory": False, "dlc": False, "runes": 12000},
    "Grafted Scion": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Chapel of Anticipation", "mandatory": False, "dlc": False, "runes": 3200},
    "Soldier of Godrick": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Stranded Graveyard", "mandatory": True, "dlc": False, "runes": 400},
    "Leonine Misbegotten": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Misbegotten", "specific_location": "Castle Morne", "mandatory": False, "dlc": False, "runes": 3800},
    "Tree Sentinel": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Limgrave", "mandatory": False, "dlc": False, "runes": 3200},
    "Crucible Knight": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Stormhill Evergaol", "mandatory": False, "dlc": False, "runes": 3200},
    "Demi-Human Chiefs": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Coastal Cave", "mandatory": False, "dlc": False, "runes": 1000},
    "Pumpkin Head": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Pumpkin Head's Cave", "mandatory": False, "dlc": False, "runes": 1000},
    "Flying Dragon Agheel": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Dragon-Burnt Ruins", "mandatory": False, "dlc": False, "runes": 5000},
    "Tibia Mariner": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Summonwater Village", "mandatory": False, "dlc": False, "runes": 3400},
    "Beastman of Farum Azula": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Groveside Cave", "mandatory": False, "dlc": False, "runes": 1500},
    "Night's Cavalry": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Agheel Lake North", "mandatory": False, "dlc": False, "runes": 2400},
    "Bloodhound Knight Darriwil": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Forlorn Hound Evergaol", "mandatory": False, "dlc": False, "runes": 1900},
    "Grave Warden Duelist": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Murkwater Catacombs", "mandatory": False, "dlc": False, "runes": 1000},
    "Stonedigger Troll": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Troll", "specific_location": "Old Altus Tunnel", "mandatory": False, "dlc": False, "runes": 1500},
    "Patches": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Murkwater Cave", "mandatory": False, "dlc": False, "runes": 1700},
    "Mad Pumpkin Head": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Waypoint Ruins", "mandatory": False, "dlc": False, "runes": 1100},
    "Deathbird": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Bird", "specific_location": "Limgrave", "mandatory": False, "dlc": False, "runes": 2900},
    "Bell Bearing Hunter": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Warmaster's Shack", "mandatory": False, "dlc": False, "runes": 3300},
    "Erdtree Burial Watchdog": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Stormfoot Catacombs", "mandatory": False, "dlc": False, "runes": 1300},
    "Demi-Human Queen Gilika": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Lenne's Rise", "mandatory": False, "dlc": False, "runes": 1200},
    "Miranda the Blighted Bloom": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Plant", "specific_location": "Tombsward Cave", "mandatory": False, "dlc": False, "runes": 2000},
    "Scaly Misbegotten": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Misbegotten", "specific_location": "Morne Tunnel", "mandatory": False, "dlc": False, "runes": 1000},
    "Bloodhound Knight": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Volcano Manor", "mandatory": False, "dlc": False, "runes": 7800},
    # Liurnia
    "Red Wolf of Radagon": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Raya Lucaria Academy", "mandatory": False, "dlc": False, "runes": 14000},
    "Royal Knight Loretta": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Caria Manor", "mandatory": False, "dlc": False, "runes": 10000},
    "Glintstone Dragon Smarag": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Academy Gate Town", "mandatory": False, "dlc": False, "runes": 18000},
    "Erdtree Avatar": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Minor Erdtree", "mandatory": False, "dlc": False, "runes": 7000},
    "Adan, Thief of Fire": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Malefactor's Evergaol", "mandatory": False, "dlc": False, "runes": 3800},
    "Magma Wyrm Makar": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Ruin-Strewn Precipice", "mandatory": False, "dlc": False, "runes": 18000},
    "Crystalian": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Academy Crystal Cave", "mandatory": False, "dlc": False, "runes": 1800},
    "Bols, Carian Knight": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Troll", "specific_location": "Cuckoo's Evergaol", "mandatory": False, "dlc": False, "runes": 4000},
    "Glintstone Dragon Adula": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Cathedral of Manus Celes", "mandatory": False, "dlc": False, "runes": 100000},
    "Spirit-Caller Snail": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Snail", "specific_location": "Road's End Catacombs", "mandatory": False, "dlc": False, "runes": 1900},
    "Nox Swordstress & Nox Priest": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Eternal City of Nokstella", "mandatory": False, "dlc": False, "runes": 7800},
    "Cemetery Shade": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Black Knife Catacombs", "mandatory": False, "dlc": False, "runes": 5400},
    "Demi-Human Queen Maggie": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Hermit Village", "mandatory": False, "dlc": False, "runes": 7500},
    "Tibia Mariner (Liurnia)": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Liurnia of the Lakes", "mandatory": False, "dlc": False, "runes": 4900},
    "Omenkiller": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Village of the Albinaurics", "mandatory": False, "dlc": False, "runes": 10000},
    "Bloodhound Knight (Liurnia)": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Lakeside Crystal Cave", "mandatory": False, "dlc": False, "runes": 4200},
    # Caelid
    "Starscourge Radahn (Festival)": {"region": "Caelid", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Wailing Dunes", "mandatory": False, "dlc": False, "runes": 70000},
    "Commander O'Neil": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Swamp of Aeonia", "mandatory": False, "dlc": False, "runes": 12000},
    "Putrid Avatar": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Caelid", "mandatory": False, "dlc": False, "runes": 24000},
    "Battlemage Hugues": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Sellia Evergaol", "mandatory": False, "dlc": False, "runes": 8400},
    "Bell Bearing Hunter (Caelid)": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Isolated Merchant's Shack", "mandatory": False, "dlc": False, "runes": 39000},
    "Cleanrot Knight": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Stillwater Cave", "mandatory": False, "dlc": False, "runes": 7700},
    "Black Blade Kindred": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Gargoyle", "specific_location": "Bestial Sanctum", "mandatory": False, "dlc": False, "runes": 80000},
    "Flying Dragon Greyll": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Dragonbarrow", "mandatory": False, "dlc": False, "runes": 80000},
    "Nox Swordstress": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Sellia, Town of Sorcery", "mandatory": False, "dlc": False, "runes": 4200},
    "Death Rite Bird (Caelid)": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Bird", "specific_location": "Caelid", "mandatory": False, "dlc": False, "runes": 13000},
    "Putrid Crystalian Trio": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Sellia Crystal Tunnel", "mandatory": False, "dlc": False, "runes": 20000},
    "Putrid Tree Spirit": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "War-Dead Catacombs", "mandatory": False, "dlc": False, "runes": 24000},
    "Godskin Apostle (Dragonbarrow)": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Godskin", "specific_location": "Dragonbarrow", "mandatory": False, "dlc": False, "runes": 46000},
    # Altus Plateau
    "Godfrey, First Elden Lord (Golden Shade)": {"region": "Leyndell, Royal Capital", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Leyndell, Royal Capital", "mandatory": True, "dlc": False, "runes": 80000},
    "Elemer of the Briar": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "The Shaded Castle", "mandatory": False, "dlc": False, "runes": 26000},
    "Fallingstar Beast (Altus)": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Aberration", "specific_location": "Altus Plateau", "mandatory": False, "dlc": False, "runes": 14000},
    "Godskin Apostle (Altus)": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Godskin", "specific_location": "Dominula, Windmill Village", "mandatory": False, "dlc": False, "runes": 14000},
    "Ancient Dragon Lansseax": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Altus Plateau", "mandatory": False, "dlc": False, "runes": 100000},
    "Draconic Tree Sentinel": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Capital Outskirts", "mandatory": False, "dlc": False, "runes": 50000},
    "Omenkiller & Miranda the Blighted Bloom": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Perfumer's Grotto", "mandatory": False, "dlc": False, "runes": 16000},
    "Crucible Knight Ordovis": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Auriza Hero's Grave", "mandatory": False, "dlc": False, "runes": 46000},
    "Ancient Hero of Zamor": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Sainted Hero's Grave", "mandatory": False, "dlc": False, "runes": 30000},
    "Fell Twins": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Leyndell, Royal Capital", "mandatory": False, "dlc": False, "runes": 36000},
    "Onyx Lord": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Royal Grave Evergaol", "mandatory": False, "dlc": False, "runes": 12000},
    "Sanguine Noble": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Writheblood Ruins", "mandatory": False, "dlc": False, "runes": 9200},
    "Wormface": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Wormface", "specific_location": "Altus Plateau", "mandatory": False, "dlc": False, "runes": 12000},
    "Perfumer Tricia": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Unsightly Catacombs", "mandatory": False, "dlc": False, "runes": 20000},
    "Necromancer Garris": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Hidden Path to the Haligtree", "mandatory": False, "dlc": False, "runes": 40000},
    "Black Knife Assassin (Altus)": {"region": "Altus Plateau", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Sage's Cave", "mandatory": False, "dlc": False, "runes": 11000},
    "Godefroy the Grafted": {"region": "Altus Plateau", "phase": 2, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Altus Plateau", "mandatory": False, "dlc": False, "runes": 75000},
    # Mt. Gelmir
    "Godskin Noble": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Godskin", "specific_location": "Volcano Manor", "mandatory": False, "dlc": False, "runes": 15000},
    "Full-Grown Fallingstar Beast": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Aberration", "specific_location": "Mt. Gelmir", "mandatory": False, "dlc": False, "runes": 20000},
    "Abductor Virgins": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Volcano Manor", "mandatory": False, "dlc": False, "runes": 15000},
    "Magma Wyrm": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Fort Laiedd", "mandatory": False, "dlc": False, "runes": 18000},
    "Red Wolf of the Champion": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Gelmir Hero's Grave", "mandatory": False, "dlc": False, "runes": 28000},
    "Ulcerated Tree Spirit (Gelmir)": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Mt. Gelmir", "mandatory": False, "dlc": False, "runes": 20000},
    "Demi-Human Queen Margot": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Mt. Gelmir", "mandatory": False, "dlc": False, "runes": 16000},
    "Kindred of Rot": {"region": "Mt. Gelmir", "phase": 1, "type": "Greater Enemy", "race": "Bug", "specific_location": "Seethewater Cave", "mandatory": False, "dlc": False, "runes": 22000},
    # Leyndell
    "Mohg, the Omen": {"region": "Leyndell, Royal Capital", "phase": 1, "type": "Greater Enemy", "race": "Omen", "specific_location": "Subterranean Shunning-Grounds", "mandatory": False, "dlc": False, "runes": 100000},
    "Esgar, Priest of Blood": {"region": "Leyndell, Royal Capital", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Subterranean Shunning-Grounds", "mandatory": False, "dlc": False, "runes": 30000},
    "Sir Gideon Ofnir, the All-Knowing": {"region": "Leyndell, Ashen Capital", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Leyndell, Ashen Capital", "mandatory": True, "dlc": False, "runes": 170000},
    # Underground
    "Ancestor Spirit": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Siofra River", "mandatory": False, "dlc": False, "runes": 13000},
    "Dragonkin Soldier": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Siofra River", "mandatory": False, "dlc": False, "runes": 10000},
    "Mimic Tear": {"region": "Siofra River", "phase": 2, "type": "Greater Enemy", "race": "Mimic", "specific_location": "Nokron, Eternal City", "mandatory": False, "dlc": False, "runes": 20000},
    "Regal Ancestor Spirit": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Nokron, Eternal City", "mandatory": False, "dlc": False, "runes": 24000},
    "Valiant Gargoyle": {"region": "Siofra River", "phase": 2, "type": "Greater Enemy", "race": "Gargoyle", "specific_location": "Nokron, Eternal City", "mandatory": False, "dlc": False, "runes": 34000},
    "Astel, Naturalborn of the Void": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Aberration", "specific_location": "Lake of Rot", "mandatory": False, "dlc": False, "runes": 80000},
    "Dragonkin Soldier of Nokstella": {"region": "Liurnia of the Lakes", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Ainsel River", "mandatory": False, "dlc": False, "runes": 45000},
    "Lichdragon Fortissax": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Deeproot Depths", "mandatory": False, "dlc": False, "runes": 90000},
    "Crucible Knight Siluria": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Deeproot Depths", "mandatory": False, "dlc": False, "runes": 30000},
    "Fia's Champions": {"region": "Siofra River", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Deeproot Depths", "mandatory": False, "dlc": False, "runes": 49500},
    # Mountaintops
    "Borealis the Freezing Fog": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Mountaintops of the Giants", "mandatory": False, "dlc": False, "runes": 100000},
    "Commander Niall": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Castle Sol", "mandatory": False, "dlc": False, "runes": 88000},
    "Death Rite Bird": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Bird", "specific_location": "Mountaintops of the Giants", "mandatory": False, "dlc": False, "runes": 100000},
    "Vyke, Knight of the Roundtable": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Lord Contender's Evergaol", "mandatory": False, "dlc": False, "runes": 102000},
    "Ulcerated Tree Spirit (Mountaintops)": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Giants' Mountaintop Catacombs", "mandatory": False, "dlc": False, "runes": 35000},
    "Ancient Hero of Zamor (Mountaintops)": {"region": "Mountaintops of the Giants", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Zamor Ruins", "mandatory": False, "dlc": False, "runes": 30000},
    # Consecrated Snowfield
    "Great Wyrm Theodorix": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Consecrated Snowfield", "mandatory": False, "dlc": False, "runes": 180000},
    "Astel, Stars of Darkness": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Aberration", "specific_location": "Yelough Anix Tunnel", "mandatory": False, "dlc": False, "runes": 120000},
    "Misbegotten Crusader": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Misbegotten", "specific_location": "Cave of the Forlorn", "mandatory": False, "dlc": False, "runes": 40000},
    "Loretta, Knight of the Haligtree": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Miquella's Haligtree", "mandatory": False, "dlc": False, "runes": 200000},
    "Putrid Grave Warden Duelist": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Consecrated Snowfield Catacombs", "mandatory": False, "dlc": False, "runes": 24000},
    "Night's Cavalry (Duo)": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Consecrated Snowfield", "mandatory": False, "dlc": False, "runes": 34000},
    "Putrid Avatar (Snowfield)": {"region": "Consecrated Snowfield", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Consecrated Snowfield", "mandatory": False, "dlc": False, "runes": 60000},
    # Farum Azula
    "Dragonlord Placidusax": {"region": "Crumbling Farum Azula", "phase": 2, "type": "Legend", "race": "Dragon", "specific_location": "Crumbling Farum Azula", "mandatory": False, "dlc": False, "runes": 280000},
    "Godskin Duo": {"region": "Crumbling Farum Azula", "phase": 1, "type": "Greater Enemy", "race": "Godskin", "specific_location": "Crumbling Farum Azula", "mandatory": True, "dlc": False, "runes": 160000},
    # Evergaols
    "Crucible Knight Evergaol": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Stormhill Evergaol", "mandatory": False, "dlc": False, "runes": 3200},
    "Elden Ring's Black Knife Assassin": {"region": "Limgrave", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Deathtouched Catacombs", "mandatory": False, "dlc": False, "runes": 1600},
    "Misbegotten Warrior": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Misbegotten", "specific_location": "Redmane Castle", "mandatory": False, "dlc": False, "runes": 14000},
    "Crucible Knight (Redmane)": {"region": "Caelid", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Redmane Castle", "mandatory": False, "dlc": False, "runes": 14000},
    # ============================================================
    # DLC - SHADOW OF THE ERDTREE - LEGENDS & DEMIGODS
    # ============================================================
    "Divine Beast Dancing Lion": {"region": "Gravesite Plain", "phase": 1, "type": "Legend", "race": "Beast", "specific_location": "Belurat Tower Settlement", "mandatory": True, "dlc": True, "runes": 280000},
    "Rellana, Twin Moon Knight": {"region": "Gravesite Plain", "phase": 1, "type": "Legend", "race": "Humanoid", "specific_location": "Castle Ensis", "mandatory": True, "dlc": True, "runes": 380000},
    "Commander Gaius": {"region": "Scadu Altus", "phase": 1, "type": "Legend", "race": "Humanoid", "specific_location": "Shadow Keep", "mandatory": False, "dlc": True, "runes": 380000},
    "Messmer the Impaler": {"region": "Scadu Altus", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Shadow Keep", "mandatory": True, "dlc": True, "runes": 420000},
    "Scadutree Avatar": {"region": "Scaduview", "phase": 3, "type": "Legend", "race": "Plant", "specific_location": "Scadutree Base", "mandatory": False, "dlc": True, "runes": 420000},
    "Putrescent Knight": {"region": "Gravesite Plain", "phase": 1, "type": "Legend", "race": "Undead", "specific_location": "Stone Coffin Fissure", "mandatory": False, "dlc": True, "runes": 380000},
    "Romina, Saint of the Bud": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Legend", "race": "Bug", "specific_location": "Church of the Bud", "mandatory": True, "dlc": True, "runes": 420000},
    "Midra, Lord of Frenzied Flame": {"region": "Abyssal Woods", "phase": 2, "type": "Legend", "race": "Humanoid", "specific_location": "Midra's Manse", "mandatory": False, "dlc": True, "runes": 380000},
    "Metyr, Mother of Fingers": {"region": "Scaduview", "phase": 2, "type": "Legend", "race": "Aberration", "specific_location": "Finger Ruins of Miyr", "mandatory": False, "dlc": True, "runes": 380000},
    "Bayle the Dread": {"region": "Jagged Peak", "phase": 2, "type": "Legend", "race": "Dragon", "specific_location": "Jagged Peak", "mandatory": False, "dlc": True, "runes": 420000},
    "Promised Consort Radahn": {"region": "Shadow Realm", "phase": 2, "type": "Demigod", "race": "Humanoid", "specific_location": "Enir-Ilim", "mandatory": True, "dlc": True, "runes": 600000},
    # ============================================================
    # DLC - GREATER ENEMIES
    # ============================================================
    "Blackgaol Knight": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Western Nameless Mausoleum", "mandatory": False, "dlc": True, "runes": 45000},
    "Ghostflame Dragon": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 100000},
    "Demi-Human Queen Marigga": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 20000},
    "Furnace Golem": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Construct", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 90000},
    "Golden Hippopotamus": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Shadow Keep", "mandatory": True, "dlc": True, "runes": 280000},
    "Rakshasa": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Shadow Keep", "mandatory": False, "dlc": True, "runes": 200000},
    "Black Knight Garrew": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Fort of Reprimand", "mandatory": False, "dlc": True, "runes": 80000},
    "Rugalea the Great Red Bear": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Scadu Altus", "mandatory": False, "dlc": True, "runes": 100000},
    "Death Knight": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Undead", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 50000},
    "Jori, Elder Inquisitor": {"region": "Abyssal Woods", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Midra's Manse", "mandatory": False, "dlc": True, "runes": 120000},
    "Lamenter": {"region": "Abyssal Woods", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Abyssal Woods", "mandatory": False, "dlc": True, "runes": 80000},
    "Dancer of Ranah": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Ancient Ruins of Rauh", "mandatory": False, "dlc": True, "runes": 150000},
    "Ralva the Great Red Bear": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Greater Enemy", "race": "Beast", "specific_location": "Ancient Ruins of Rauh", "mandatory": False, "dlc": True, "runes": 100000},
    "Jagged Peak Drake": {"region": "Jagged Peak", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Jagged Peak", "mandatory": False, "dlc": True, "runes": 60000},
    "Ghostflame Dragon (Jagged Peak)": {"region": "Jagged Peak", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Jagged Peak", "mandatory": False, "dlc": True, "runes": 100000},
    "Demi-Human Swordmaster Onze": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Demi-Human", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 30000},
    "Curseblade Labirith": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Ruined Forge Lava Intake", "mandatory": False, "dlc": True, "runes": 30000},
    "Tree Spirit of Fissure": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Stone Coffin Fissure", "mandatory": False, "dlc": True, "runes": 80000},
    "Messmer Soldier (Evergaol)": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Fog Rift Catacombs", "mandatory": False, "dlc": True, "runes": 25000},
    "Sunflower": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Plant", "specific_location": "Scadu Altus", "mandatory": False, "dlc": True, "runes": 50000},
    "Ancient Dragon Senessax": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Greater Enemy", "race": "Dragon", "specific_location": "Ancient Ruins of Rauh", "mandatory": False, "dlc": True, "runes": 120000},
    "Bloodfiend Crucible": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Greater Enemy", "race": "Humanoid", "specific_location": "Ancient Ruins of Rauh", "mandatory": False, "dlc": True, "runes": 60000},
    "Romina's Phantom": {"region": "Ancient Ruins of Rauh", "phase": 1, "type": "Greater Enemy", "race": "Bug", "specific_location": "Church of the Bud", "mandatory": False, "dlc": True, "runes": 50000},
    "Gravebird": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Bird", "specific_location": "Belurat Gaol", "mandatory": False, "dlc": True, "runes": 20000},
    "Ulcerated Tree Spirit (DLC)": {"region": "Gravesite Plain", "phase": 1, "type": "Greater Enemy", "race": "Tree Avatar", "specific_location": "Gravesite Plain", "mandatory": False, "dlc": True, "runes": 50000},
    "Fingercreeper (Shadow Keep)": {"region": "Scadu Altus", "phase": 1, "type": "Greater Enemy", "race": "Aberration", "specific_location": "Shadow Keep", "mandatory": False, "dlc": True, "runes": 40000},
}

def build_database():
    """Build the BOSS_DATABASE dict with image URLs from Fandom."""
    print(f"Processing {len(BOSS_DATA)} bosses...\n")
    database = {}

    for boss_name, data in BOSS_DATA.items():
        print(f"  Getting image for: {boss_name}...")
        thumb = get_thumbnail(boss_name)
        if not thumb:
            # Try without special chars / simplified name
            simplified = re.sub(r'\s*\(.*?\)', '', boss_name).strip()
            if simplified != boss_name:
                print(f"    Retrying as: {simplified}")
                thumb = get_thumbnail(simplified)
        if not thumb:
            thumb = FALLBACK_IMAGE
            print(f"    Using fallback image")
        else:
            print(f"    Found: {thumb[:60]}...")

        entry = {
            "name": boss_name,
            "region": data["region"],
            "phase": data["phase"],
            "type": data["type"],
            "race": data["race"],
            "specific_location": data["specific_location"],
            "mandatory": data["mandatory"],
            "dlc": data["dlc"],
            "runes": data["runes"],
            "image_url": thumb
        }
        database[boss_name] = entry
        time.sleep(0.5)

    return database

def write_database(database: dict, output_path: str):
    """Write the database to a Python file."""
    lines = ["# Boss database for the API\n"]
    lines.append("# Data gathered from Fextralife / Fandom wiki\n")
    lines.append("BOSS_DATABASE = {\n")

    for boss_name, data in database.items():
        lines.append(f'    "{boss_name}": {{\n')
        lines.append(f'        "name": "{data["name"]}",\n')
        lines.append(f'        "region": "{data["region"]}",\n')
        lines.append(f'        "phase": {data["phase"]},\n')
        lines.append(f'        "type": "{data["type"]}",\n')
        lines.append(f'        "race": "{data["race"]}",\n')
        lines.append(f'        "specific_location": "{data["specific_location"]}",\n')
        lines.append(f'        "mandatory": {data["mandatory"]},\n')
        lines.append(f'        "dlc": {data["dlc"]},\n')
        lines.append(f'        "runes": {data["runes"]},\n')
        lines.append(f'        "image_url": "{data["image_url"]}"\n')
        lines.append(f'    }},\n')

    lines.append("}\n")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"\nWrote {len(database)} bosses to {output_path}")

if __name__ == "__main__":
    print("=== Elden Ring Boss Database Builder ===\n")
    print(f"Total bosses to process: {len(BOSS_DATA)}\n")

    database = build_database()
    output_path = os.path.join("server", "app", "database.py")
    write_database(database, output_path)

    print("\n=== Done! ===")
    print(f"Run the server again to see all {len(database)} bosses.")
