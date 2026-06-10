import subprocess
import io
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    cmd = ["git", "show", git_path]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0:
        data = res.stdout
        img = Image.open(io.BytesIO(data))
        print(f"Git {img_name}: size={img.size}, mode={img.mode}, format={img.format}, bytes={len(data)}")
        # Check transparency
        if img.mode == "RGBA":
            img_rgba = img
        else:
            img_rgba = img.convert("RGBA")
            
        width, height = img_rgba.size
        opaque = 0
        fully_transparent = 0
        semi_transparent = 0
        white_pixels = 0
        for x in range(width):
            for y in range(height):
                r, g, b, a = img_rgba.getpixel((x, y))
                if a == 0:
                    fully_transparent += 1
                elif a == 255:
                    opaque += 1
                    if r >= 250 and g >= 250 and b >= 250:
                        white_pixels += 1
                else:
                    semi_transparent += 1
        print(f"  Opaque: {opaque} (White: {white_pixels})")
        print(f"  Fully Transparent: {fully_transparent}")
        print(f"  Semi-transparent: {semi_transparent}")
    else:
        print(f"Failed to get {img_name} from git: {res.stderr.decode('utf-8', errors='ignore')}")
