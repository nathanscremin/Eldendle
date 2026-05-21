import requests
import json
import urllib.parse
from server.app.database import BOSS_DATABASE

path = r'server/app/database.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

for boss_name, data in BOSS_DATABASE.items():
    safe_name = urllib.parse.quote(boss_name)
    url = f"https://eldenring.fandom.com/api.php?action=query&titles={safe_name}&prop=pageimages&format=json&pithumbsize=200"
    
    try:
        response = requests.get(url, verify=False, timeout=5)
        if response.status_code == 200:
            res_data = response.json()
            pages = res_data.get("query", {}).get("pages", {})
            image_url = None
            for page_id, page_info in pages.items():
                if "thumbnail" in page_info:
                    image_url = page_info["thumbnail"]["source"]
                    break
            
            if image_url:
                old_url = data['image_url']
                if old_url in text:
                    text = text.replace(old_url, image_url)
                    print(f"Updated {boss_name}: {image_url}")
                else:
                    print(f"Could not find old URL in text for {boss_name}")
            else:
                print(f"No thumbnail found for {boss_name} on Fandom")
    except Exception as e:
        print(f"Error fetching {boss_name}: {e}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Done updating URLs in database.py")
