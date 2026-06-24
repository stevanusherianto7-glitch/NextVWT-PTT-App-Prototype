import numpy as np
from PIL import Image

img = Image.open(r'src/assets/icon_voice.png')
data = np.array(img)
alpha = data[:, :, 3]

for y in range(0, alpha.shape[0], 2):
    line = ""
    for x in range(0, alpha.shape[1], 1):
        if alpha[y, x] > 128:
            line += "#"
        elif alpha[y, x] > 0:
            line += "."
        else:
            line += " "
    print(line)
