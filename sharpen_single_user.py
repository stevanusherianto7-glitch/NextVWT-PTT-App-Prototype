import numpy as np
from PIL import Image, ImageFilter
from skimage import morphology

path = 'src/assets/icon_username.png'
img = Image.open(path).convert('RGBA')
data = np.array(img)

# Step 1: Hard threshold on alpha — remove semi-transparent fringe pixels
alpha = data[:, :, 3]
hard_mask = alpha > 40  # only keep solid pixels
data[:, :, 3] = np.where(hard_mask, 255, 0)

# Step 2: Morphological clean — remove stray 1-2px noise at edges
from skimage.morphology import binary_erosion, binary_dilation, disk
cleaned = binary_erosion(hard_mask, disk(1))
cleaned = binary_dilation(cleaned, disk(1))
data[:, :, 3] = np.where(cleaned, 255, 0)

# Step 3: Tight-crop to actual content
rows = np.any(data[:, :, 3] > 0, axis=1)
cols = np.any(data[:, :, 3] > 0, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]
data = data[ymin:ymax+1, xmin:xmax+1]

# Step 4: Center on 52x52 canvas
TARGET = 52
canvas = np.zeros((TARGET, TARGET, 4), dtype=np.uint8)
ch, cw = data.shape[:2]
oy = (TARGET - ch) // 2
ox = (TARGET - cw) // 2
canvas[oy:oy+ch, ox:ox+cw] = data
result_img = Image.fromarray(canvas, 'RGBA')

# Step 5: Unsharp mask on RGB channels only (keep alpha hard)
r, g, b, a = result_img.split()
rgb = Image.merge('RGB', (r, g, b))
sharp = rgb.filter(ImageFilter.UnsharpMask(radius=1.5, percent=140, threshold=2))
r2, g2, b2 = sharp.split()
result_img = Image.merge('RGBA', (r2, g2, b2, a))

result_img.save(path)
final = Image.open(path)
print(f'Done. Final size: {final.size}')
