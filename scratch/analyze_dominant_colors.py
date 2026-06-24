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
        img = Image.open(io.BytesIO(data)).convert("RGB")
        width, height = img.size
        
        # We sample a grid of pixels
        colors = {}
        for x in range(0, width, 5):
            for y in range(0, height, 5):
                r, g, b = img.getpixel((x, y))
                if r < 245 or g < 245 or b < 245:  # ignore white/near-white background
                    color = (r, g, b)
                    colors[color] = colors.get(color, 0) + 1
                    
        # Sort by count
        sorted_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)
        print(f"\n{img_name} dominant non-white colors:")
        for color, count in sorted_colors[:15]:
            # Convert to hex for readability
            hex_color = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
            print(f"  Color: {color} ({hex_color}), Count: {count}")
    else:
        print(f"Failed to get {img_name}")
