import os
from PIL import Image
import numpy as np

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 
    'icon_username.png', 'icon_wait_controlled.png', 'icon_noc.png'
]

print(f"{'Icon':<28} {'File Size':>12}  {'Actual Content':>16}  {'Square?':>8}")
print("-" * 72)

sizes = []
for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        data = np.array(img)
        
        # Find tight bounding box of actual content
        rows = np.any(data[:, :, 3] > 0, axis=1)
        cols = np.any(data[:, :, 3] > 0, axis=0)
        
        if np.any(rows) and np.any(cols):
            ymin, ymax = np.where(rows)[0][[0, -1]]
            xmin, xmax = np.where(cols)[0][[0, -1]]
            content_w = xmax - xmin + 1
            content_h = ymax - ymin + 1
        else:
            content_w, content_h = 0, 0
        
        w, h = img.size
        is_square = "YES" if w == h else f"NO ({w}x{h})"
        sizes.append((w, h))
        print(f"{icon_name:<28} {w}x{h:>7}    {content_w}x{content_h:>10}   {is_square:>8}")

print()
unique_sizes = set(sizes)
if len(unique_sizes) == 1:
    print(f"RESULT: ALL UNIFORM -> {unique_sizes.pop()}")
else:
    print(f"RESULT: NOT UNIFORM -> sizes found: {unique_sizes}")
