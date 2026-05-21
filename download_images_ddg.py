import os
import requests
import urllib.parse
from duckduckgo_search import DDGS
from server.app.database import BOSS_DATABASE

images_dir = os.path.join('client', 'web', 'static', 'images')
os.makedirs(images_dir, exist_ok=True)

ddgs = DDGS()

def download_image(boss_name):
    safe_name = urllib.parse.quote(boss_name)
    filepath = os.path.join(images_dir, f"{safe_name}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        return True
    
    try:
        # Search DDG for an image
        query = f"Elden Ring {boss_name} face fextralife wiki"
        results = list(ddgs.images(query, max_results=3))
        for res in results:
            img_url = res.get('image')
            if img_url:
                try:
                    response = requests.get(img_url, timeout=10)
                    if response.status_code == 200:
                        with open(filepath, 'wb') as f:
                            f.write(response.content)
                        print(f"Downloaded DDG image for: {boss_name}")
                        return True
                except:
                    continue
    except Exception as e:
        print(f"Failed DDG search for {boss_name}: {e}")
        
    return False

for boss_name, data in BOSS_DATABASE.items():
    download_image(boss_name)

# Also download the fallback image
fallback_url = "https://static.wikia.nocookie.net/eldenring/images/1/10/Elden_Ring_logo.png/revision/latest/scale-to-width-down/200"
fallback_path = os.path.join(images_dir, "fallback.png")
if not os.path.exists(fallback_path):
    try:
        response = requests.get(fallback_url, timeout=10)
        if response.status_code == 200:
            with open(fallback_path, 'wb') as f:
                f.write(response.content)
            print("Downloaded fallback logo.")
    except Exception as e:
        print(f"Failed to download fallback logo: {e}")

print("Image download complete.")
