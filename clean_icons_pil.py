import os
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
        try:
            img = Image.open(path).convert('RGBA')
            data = img.getdata()
            new_data = []
            for item in data:
                # Make edge sharp by binarizing alpha channel
                # threshold at 50 to keep more of the icon
                if item[3] > 50:
                    # preserve original RGB, force alpha to 255
                    new_data.append((item[0], item[1], item[2], 255))
                else:
                    new_data.append((255, 255, 255, 0))
            
            img.putdata(new_data)
            img.save(path)
            print(f"Cleaned {icon} edges with Pillow")
        except Exception as e:
            print(f"Failed to process {icon}: {e}")
