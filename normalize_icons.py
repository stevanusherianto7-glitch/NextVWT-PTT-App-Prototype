import os
from PIL import Image

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 'icon_username.png'
]

# Find max size
max_w = 0
max_h = 0
for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        with Image.open(path) as img:
            w, h = img.size
            if w > max_w: max_w = w
            if h > max_h: max_h = h

target_size = max(max_w, max_h)
# Add a little padding to be safe and make it an even number
target_size = target_size if target_size % 2 == 0 else target_size + 1
target_size = max(target_size, 64) # Ensure at least 64x64

print(f"Normalizing all icons to {target_size}x{target_size}...")

for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        w, h = img.size
        
        # Create new transparent square image
        new_img = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
        
        # Paste original image into the center
        offset_x = (target_size - w) // 2
        offset_y = (target_size - h) // 2
        new_img.paste(img, (offset_x, offset_y))
        
        new_img.save(path)
        print(f"Resized {icon_name} from {w}x{h} to {target_size}x{target_size}")
