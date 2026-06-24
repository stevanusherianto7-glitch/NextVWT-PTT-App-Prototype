import subprocess
import io
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode == 0:
        data = res.stdout
        img = Image.open(io.BytesIO(data)).convert("RGB")
        width, height = img.size
        
        # Let's resize it to 40x40 to print as ASCII art
        small_img = img.resize((40, 30))
        print(f"\n=================== {img_name} ASCII Art (40x30) ===================")
        for y in range(30):
            line = ""
            for x in range(40):
                r, g, b = small_img.getpixel((x, y))
                avg = (r + g + b) / 3.0
                # If it is white/near-white, print space
                if r >= 238 and g >= 238 and b >= 238:
                    line += " "
                else:
                    # Depending on brightness, use different characters
                    if avg < 100:
                        line += "#"
                    elif avg < 160:
                        line += "*"
                    else:
                        line += "."
            print(line)
    else:
        print(f"Failed to get {img_name}")
