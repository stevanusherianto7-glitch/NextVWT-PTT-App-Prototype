import subprocess
import io
import math
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"
directions = {
    "N": (0, -1),
    "NE": (1, -1),
    "E": (1, 0),
    "SE": (1, 1),
    "S": (0, 1),
    "SW": (-1, 1),
    "W": (-1, 0),
    "NW": (-1, -1)
}

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode == 0:
        img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
        width, height = img.size
        cx, cy = width // 2, height // 2
        print(f"\n{img_name} boundary tracing:")
        for dir_name, (dx, dy) in directions.items():
            # Normalize direction vector
            length = math.sqrt(dx*dx + dy*dy)
            ndx = dx / length
            ndy = dy / length
            
            # Start from outer edge and go inward
            r = min(cx, cy) * 1.4
            found = False
            while r > 0:
                x = int(cx + r * ndx)
                y = int(cy + r * ndy)
                if 0 <= x < width and 0 <= y < height:
                    pr, pg, pb = img.getpixel((x, y))
                    # check if not pure white
                    if pr < 254 or pg < 254 or pb < 254:
                        print(f"  {dir_name}: hit at r={r:.1f}, pixel=({pr},{pg},{pb})")
                        found = True
                        break
                r -= 1
            if not found:
                print(f"  {dir_name}: no hit found")
    else:
        print(f"Failed to get {img_name}")
