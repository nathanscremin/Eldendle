import os
import urllib.request
import urllib.parse
import ssl
from server.app.database import BOSS_DATABASE

images_dir = os.path.join('client', 'web', 'static', 'images')
os.makedirs(images_dir, exist_ok=True)

context = ssl._create_unverified_context()

for boss_name, data in BOSS_DATABASE.items():
    safe_name = urllib.parse.quote(boss_name)
    image_url = data.get("image_url")
    if image_url:
        filepath = os.path.join(images_dir, f"{safe_name}.jpg")
        if not os.path.exists(filepath):
            try:
                # Need a User-Agent to avoid getting blocked sometimes
                req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(req, timeout=10, context=context) as response:
                    img_data = response.read()
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                print(f"Downloaded: {boss_name}")
            except Exception as e:
                print(f"Failed to download {boss_name}: {e}")

# Also download the fallback image
fallback_url = "https://static.wikia.nocookie.net/eldenring/images/1/10/Elden_Ring_logo.png/revision/latest/scale-to-width-down/200"
fallback_path = os.path.join(images_dir, "fallback.png")
if not os.path.exists(fallback_path):
    try:
        req = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10, context=context) as response:
            with open(fallback_path, 'wb') as f:
                f.write(response.read())
        print("Downloaded fallback logo.")
    except Exception as e:
        print(f"Failed to download fallback logo: {e}")

print("Image download complete.")
