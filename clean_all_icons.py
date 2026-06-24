import os
from rembg import remove
from PIL import Image

assets_dir = 'src/assets'
icons = [
    'icon_controlled.png',
    'icon_moderator.png',
    'icon_noc.png',
    'icon_operator.png',
    'icon_silent.png',
    'icon_voice.png',
    'icon_wait.png'
]

for icon in icons:
    path = os.path.join(assets_dir, icon)
    if os.path.exists(path):
        print(f"Processing {icon}...")
        try:
            input_img = Image.open(path).convert('RGBA')
            output_img = remove(input_img)
            output_img.save(path)
            print(f"Successfully cleaned {icon}")
        except Exception as e:
            print(f"Error processing {icon}: {e}")
