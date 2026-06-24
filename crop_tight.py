import os
from PIL import Image
import numpy as np

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png', 'icon_operator.png', 'icon_voice.png', 
    'icon_controlled.png', 'icon_wait.png', 'icon_silent.png', 'icon_username.png'
]

print("Cropping icons to tight bounding box...")

for icon_name in icons:
    path = os.path.join(assets_dir, icon_name)
    if os.path.exists(path):
        img = Image.open(path).convert('RGBA')
        data = np.array(img)
        
        # Find rows and columns where alpha > 0
        rows = np.any(data[:, :, 3] > 0, axis=1)
        cols = np.any(data[:, :, 3] > 0, axis=0)
        
        if not np.any(rows) or not np.any(cols):
            print(f"Skipping {icon_name} (empty image)")
            continue
            
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # Crop the image to exact bounds
        cropped_img = img.crop((xmin, ymin, xmax + 1, ymax + 1))
        
        cropped_img.save(path)
        print(f"Cropped {icon_name} from {img.size} to {cropped_img.size}")
