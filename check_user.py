import numpy as np
from PIL import Image
import base64

img = Image.open(r'src/assets/icon_username.png').convert('RGBA')
data = np.array(img)
print("Shape of icon_username:", data.shape)
