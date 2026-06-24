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
        
        # We sample pixels and look for ones with high saturation / color difference
        colored_pixels = []
        min_diff = 20  # color difference between max and min channel
        
        for x in range(0, width, 5):
            for y in range(0, height, 5):
                r, g, b = img.getpixel((x, y))
                max_c = max(r, g, b)
                min_c = min(r, g, b)
                diff = max_c - min_c
                if diff >= min_diff:
                    colored_pixels.append((r, g, b))
                    
        print(f"\n{img_name}:")
        print(f"  Found {len(colored_pixels)} colored pixels (diff >= {min_diff})")
        if colored_pixels:
            # Let's count them
            color_counts = {}
            for col in colored_pixels:
                color_counts[col] = color_counts.get(col, 0) + 1
            sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
            print("  Top 10 colored pixels:")
            for col, count in sorted_colors[:10]:
                hex_color = f"#{col[0]:02x}{col[1]:02x}{col[2]:02x}"
                print(f"    Color: {col} ({hex_color}), Count: {count}")
        else:
            print("  No colored pixels found!")
    else:
        print(f"Failed to get {img_name}")
