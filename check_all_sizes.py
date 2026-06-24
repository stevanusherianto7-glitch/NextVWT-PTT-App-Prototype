import os
from PIL import Image

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 
    'icon_username.png', 'icon_wait_controlled.png', 'icon_noc.png'
]

for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"{icon_name}: {img.size[0]}x{img.size[1]}")
