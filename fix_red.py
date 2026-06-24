import os
import numpy as np
from PIL import Image

assets_dir = 'src/assets'
wait_path = os.path.join(assets_dir, 'icon_wait.png')
wait_ctrl_path = os.path.join(assets_dir, 'icon_wait_controlled.png')

img = Image.open(wait_path).convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0].astype(float), data[:,:,1].astype(float), data[:,:,2].astype(float), data[:,:,3]

# Identify blue pixels (the outer ring and hands)
# White face has r,g,b all roughly equal and high (e.g. > 200)
# The blue ring has b > r and b > g.
blue_mask = (b > r + 10) & (b > g + 10) & (a > 0)

new_data = data.copy()

# For blue pixels, make them a strong, solid red
# We take the original blue intensity 'b' to keep the shading, but we boost it to make the red solid.
L = b[blue_mask]
# Map L to a strong red palette
new_r = np.clip(L * 1.5 + 50, 0, 255)
new_g = np.clip(g[blue_mask] * 0.3, 0, 255)
new_b = np.clip(r[blue_mask] * 0.3, 0, 255)

new_data[blue_mask, 0] = new_r
new_data[blue_mask, 1] = new_g
new_data[blue_mask, 2] = new_b

# What about the very dark edges of the blue ring where b might not be > r + 10?
# E.g. dark grey-blue pixels on the anti-aliased edge.
# Let's also catch dark pixels that are slightly blue.
dark_blue_mask = (b > r) & (a > 0) & (~blue_mask) & (b < 100)
new_data[dark_blue_mask, 0] = np.clip(b[dark_blue_mask] * 1.5 + 30, 0, 255)
new_data[dark_blue_mask, 1] = g[dark_blue_mask] * 0.3
new_data[dark_blue_mask, 2] = r[dark_blue_mask] * 0.3

Image.fromarray(new_data.astype(np.uint8)).save(wait_ctrl_path)
print("Made wait_ctrl red more solid")
