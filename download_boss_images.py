"""
Script to download all boss images locally.
Run from the project root directory.
"""
import os
import re
import urllib.request
import urllib.error
import time

IMAGES_DIR = os.path.join("client", "web", "static", "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Boss name -> image URL mapping from database
from server.app.database import BOSS_DATABASE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://eldenring.wiki.fextralife.com/"
}

FALLBACK_URL = "https://static.wikia.nocookie.net/eldenring/images/1/10/Elden_Ring_logo.png/revision/latest/scale-to-width-down/200"

def safe_filename(name: str) -> str:
    """Convert boss name to safe filename."""
    return re.sub(r'[^\w\s-]', '', name).strip().replace(' ', '_') + ".jpg"

def download_image(url: str, filepath: str) -> bool:
    """Try to download image from URL, return True on success."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read()
            if len(data) < 1000:  # Too small = likely an error page
                return False
            with open(filepath, 'wb') as f:
                f.write(data)
            return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

def get_fandom_thumbnail(boss_name: str) -> str | None:
    """Try to get a thumbnail from the Fandom API."""
    import json
    search_title = boss_name.replace(" ", "_")
    api_url = f"https://eldenring.fandom.com/api.php?action=query&titles={urllib.parse.quote(search_title)}&prop=pageimages&format=json&pithumbsize=200"
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": HEADERS["User-Agent"]})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                thumb = page.get("thumbnail", {}).get("source")
                if thumb:
                    return thumb
    except:
        pass
    return None

import urllib.parse

success_count = 0
fail_count = 0
url_updates = {}

print(f"Downloading images for {len(BOSS_DATABASE)} bosses...\n")

for boss_name, boss_data in BOSS_DATABASE.items():
    filename = safe_filename(boss_name)
    filepath = os.path.join(IMAGES_DIR, filename)
    local_url = f"/static/images/{filename}"

    # Skip if already downloaded and non-empty
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        url_updates[boss_name] = local_url
        success_count += 1
        print(f"  [SKIP] {boss_name} (already exists)")
        continue

    print(f"  Downloading: {boss_name}")
    original_url = boss_data.get("image_url", "")
    downloaded = False

    # Try the original URL first
    if original_url and original_url != FALLBACK_URL:
        downloaded = download_image(original_url, filepath)

    # If failed, try Fandom API
    if not downloaded:
        print(f"    Trying Fandom API...")
        thumb_url = get_fandom_thumbnail(boss_name)
        if thumb_url:
            print(f"    Found: {thumb_url}")
            downloaded = download_image(thumb_url, filepath)

    if downloaded:
        url_updates[boss_name] = local_url
        success_count += 1
        print(f"    [OK] Saved to {filename}")
    else:
        # Download the fallback logo
        download_image(FALLBACK_URL, filepath)
        url_updates[boss_name] = local_url
        fail_count += 1
        print(f"    [FALLBACK] Using logo for {boss_name}")

    time.sleep(0.3)  # Rate limiting

# Update database.py with local paths
print(f"\n\nResults: {success_count} OK, {fail_count} used fallback")
print("Updating database.py with local image paths...")

db_path = os.path.join("server", "app", "database.py")
with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

for boss_name, local_url in url_updates.items():
    old_url_pattern = re.escape(BOSS_DATABASE[boss_name].get("image_url", ""))
    if old_url_pattern and not BOSS_DATABASE[boss_name]["image_url"].startswith("/static/"):
        content = content.replace(
            f'"image_url": "{BOSS_DATABASE[boss_name]["image_url"]}"',
            f'"image_url": "{local_url}"'
        )

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! database.py updated with local paths.")
print(f"Images saved to: {os.path.abspath(IMAGES_DIR)}")
