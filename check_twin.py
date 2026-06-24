from PIL import Image
import numpy as np

img = Image.open('src/assets/icon_user_baru.png').convert('RGBA')
data = np.array(img)
rows = np.any(data[:, :, 3] > 0, axis=1)
cols = np.any(data[:, :, 3] > 0, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]
print(f"Twin user icon size: {img.size}")
print(f"Twin user icon bounding box: w={xmax - xmin + 1}, h={ymax - ymin + 1}")
