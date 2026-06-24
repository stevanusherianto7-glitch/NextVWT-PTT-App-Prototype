import subprocess
import io
from PIL import Image

commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"
git_path = f"{commit}:src/assets/icon_operator_otomatis.png"

res = subprocess.run(["git", "show", git_path], capture_output=True)
if res.returncode == 0:
    img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
    width, height = img.size
    
    # Let's count colors that are not white
    colors = {}
    max_diff = 0
    for x in range(0, width, 5):
        for y in range(0, height, 5):
            r, g, b = img.getpixel((x, y))
            if r < 255 or g < 255 or b < 255:
                colors[(r, g, b)] = colors.get((r, g, b), 0) + 1
                max_diff = max(max_diff, max(r, g, b) - min(r, g, b))
                
    sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
    print(f"Max channel difference in operator icon: {max_diff}")
    print("Top 15 non-white colors in operator icon:")
    for col, count in sorted_colors[:15]:
        print(f"  Color: {col}, Count: {count}")
else:
    print("Failed to get operator icon")
