import os
from PIL import Image, ImageFilter
import numpy as np

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 
    'icon_username.png', 'icon_wait_controlled.png', 'icon_noc.png'
]

TARGET = 52  # px

print(f"Normalizing all icons to {TARGET}x{TARGET} canvas (center-padded)...")

for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if not os.path.exists(path):
        continue

    img = Image.open(path).convert('RGBA')
    data = np.array(img)

    # Tight crop first
    rows = np.any(data[:, :, 3] > 0, axis=1)
    cols = np.any(data[:, :, 3] > 0, axis=0)
    if not np.any(rows) or not np.any(cols):
        print(f"  SKIP {icon_name} (empty)")
        continue

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    cropped = img.crop((xmin, ymin, xmax + 1, ymax + 1))
    cw, ch = cropped.size

    # If already fits in TARGET, just center it
    if cw <= TARGET and ch <= TARGET:
        canvas = Image.new('RGBA', (TARGET, TARGET), (0, 0, 0, 0))
        ox = (TARGET - cw) // 2
        oy = (TARGET - ch) // 2
        canvas.paste(cropped, (ox, oy))
        result = canvas
    else:
        # Scale down proportionally to fit TARGET
        ratio = min(TARGET / cw, TARGET / ch)
        new_w = int(cw * ratio)
        new_h = int(ch * ratio)
        resized = cropped.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new('RGBA', (TARGET, TARGET), (0, 0, 0, 0))
        ox = (TARGET - new_w) // 2
        oy = (TARGET - new_h) // 2
        canvas.paste(resized, (ox, oy))
        result = canvas

    # Apply Unsharp Mask to sharpen edges
    r, g, b, a = result.split()
    rgb = Image.merge('RGB', (r, g, b))
    sharp = rgb.filter(ImageFilter.UnsharpMask(radius=1.5, percent=120, threshold=2))
    r2, g2, b2 = sharp.split()
    result = Image.merge('RGBA', (r2, g2, b2, a))

    result.save(path)
    print(f"  {icon_name}: content {cw}x{ch} -> canvas {TARGET}x{TARGET}")

print("Done!")
