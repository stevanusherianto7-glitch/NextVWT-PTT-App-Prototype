import subprocess
import io
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode == 0:
        img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
        width, height = img.size
        print(f"\n{img_name}:")
        print(f"  Top-Left (10, 10): {img.getpixel((10, 10))}")
        print(f"  Top-Right (width-10, 10): {img.getpixel((width-10, 10))}")
        print(f"  Bottom-Left (10, height-10): {img.getpixel((10, height-10))}")
        print(f"  Bottom-Right (width-10, height-10): {img.getpixel((width-10, height-10))}")
        print(f"  Center (width//2, height//2): {img.getpixel((width//2, height//2))}")
    else:
        print(f"Failed to get {img_name}")
