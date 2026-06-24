import numpy as np
from PIL import Image

img = Image.open(r'src/assets/icon_voice.png')
data = np.array(img)
print("Shape:", data.shape)

# Let's count non-transparent pixels in the left half vs right half
h, w, c = data.shape
left_alpha = data[:, :w//2, 3]
right_alpha = data[:, w//2:, 3]
print("Left half non-transparent pixels:", np.sum(left_alpha > 0))
print("Right half non-transparent pixels:", np.sum(right_alpha > 0))

# Try to describe the image: bounding box
rows = np.any(data[:, :, 3] > 0, axis=1)
cols = np.any(data[:, :, 3] > 0, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]
print(f"Bounding box: y={ymin}-{ymax}, x={xmin}-{xmax}")
