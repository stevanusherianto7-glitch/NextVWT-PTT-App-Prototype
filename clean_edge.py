import os
import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion

assets_dir = 'src/assets'
icons = [
    'icon_moderator.png',
    'icon_operator.png',
    'icon_voice.png',
    'icon_controlled.png',
    'icon_wait.png',
    'icon_wait_controlled.png',
    'icon_silent.png'
]

for icon in icons:
    path = os.path.join(assets_dir, icon)
    if not os.path.exists(path): continue
    
    img = Image.open(path).convert('RGBA')
    data = np.array(img)
    
    # Current alpha
    alpha = data[:, :, 3] > 128
    
    # Erode the alpha mask by 1 pixel to remove the anti-aliased fringe
    eroded_alpha = binary_erosion(alpha)
    
    # Apply new alpha
    new_data = data.copy()
    new_data[~eroded_alpha, 3] = 0
    new_data[eroded_alpha, 3] = 255
    
    Image.fromarray(new_data).save(path)
    print(f"Cleaned {icon} edges")
