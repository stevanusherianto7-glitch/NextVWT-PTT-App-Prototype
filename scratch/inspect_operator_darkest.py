import subprocess
import io
from PIL import Image

commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"
git_path = f"{commit}:src/assets/icon_operator_otomatis.png"

res = subprocess.run(["git", "show", git_path], capture_output=True)
if res.returncode == 0:
    img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
    width, height = img.size
    
    min_rgb = (255, 255, 255)
    min_val = 255
    for x in range(width):
        for y in range(height):
            r, g, b = img.getpixel((x, y))
            val = (int(r) + int(g) + int(b)) // 3
            if val < min_val:
                min_val = val
                min_rgb = (r, g, b)
                
    print(f"Darkest pixel in operator icon: {min_rgb} (average={min_val})")
else:
    print("Failed to get operator icon")
