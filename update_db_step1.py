import os
import urllib.request
import urllib.parse
import json

path = r'server/app/database.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if '"mandatory":' in line:
        # Add dlc line right after mandatory
        # Determine if DLC based on name
        is_dlc = False
        new_lines.append(line.replace('"mandatory"', '"dlc"').replace('True', 'False')) # Default to false for now, we'll fix it later

# We can just write a simple script to add DLC tags
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
