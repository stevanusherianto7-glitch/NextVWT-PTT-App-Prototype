import os
import numpy as np
from PIL import Image

assets_dir = 'src/assets'
wait_icon_path = os.path.join(assets_dir, 'icon_wait.png')
out_path = os.path.join(assets_dir, 'icon_wait_controlled.png')

img = Image.open(wait_icon_path).convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Identify blue pixels. 
blue_mask = (b > r) & (a > 0)

new_data = data.copy()
# Swap R and B
new_data[blue_mask, 0] = b[blue_mask]
new_data[blue_mask, 2] = r[blue_mask]

Image.fromarray(new_data).save(out_path)
print("Generated icon_wait_controlled.png")
