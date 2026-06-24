import os
import glob
from PIL import Image, ImageFilter

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 'icon_username.png'
]

for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        
        # Split channels
        r, g, b, a = img.split()
        
        # Create an RGB image for sharpening the color content
        rgb = Image.merge('RGB', (r, g, b))
        
        # Apply Unsharp Mask for precise sharpening of details
        # Radius 2, Percent 150, Threshold 3
        sharpened_rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        
        # Merge back with original alpha
        r2, g2, b2 = sharpened_rgb.split()
        final_img = Image.merge('RGBA', (r2, g2, b2, a))
        
        final_img.save(path)
        print(f"Sharpened {icon_name}")
