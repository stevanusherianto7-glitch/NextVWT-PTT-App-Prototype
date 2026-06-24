import subprocess
import io
import math
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
        cx, cy = width / 2.0, height / 2.0
        
        radii = []
        for angle_deg in range(0, 360, 2):
            angle = math.radians(angle_deg)
            dx = math.cos(angle)
            dy = math.sin(angle)
            
            r = 0.0
            last_valid_r = 0.0
            while r < min(cx, cy) * 1.2:
                x = int(cx + r * dx)
                y = int(cy + r * dy)
                if 0 <= x < width and 0 <= y < height:
                    pr, pg, pb = img.getpixel((x, y))
                    
                    # Compute mean and standard deviation
                    avg_val = (int(pr) + int(pg) + int(pb)) / 3.0
                    variance = ((pr - avg_val)**2 + (pg - avg_val)**2 + (pb - avg_val)**2) / 3.0
                    std = math.sqrt(variance)
                    
                    is_badge = False
                    if img_name == "icon_moderator.png":
                        is_badge = (std > 15) or (pr > 150 and pb < 100)
                    elif img_name == "icon_voice.png":
                        is_badge = (std > 12) or (pb > 120 and pr < 100)
                    else:
                        is_badge = (avg_val < 238)
                        
                    if is_badge:
                        last_valid_r = r
                else:
                    break
                r += 0.5
            radii.append(last_valid_r)
            
        avg_r = sum(radii) / len(radii)
        min_r = min(radii)
        max_r = max(radii)
        # compute std of radii
        mean_radii = sum(radii) / len(radii)
        var_radii = sum((x - mean_radii)**2 for x in radii) / len(radii)
        std_radii = math.sqrt(var_radii)
        
        print(f"\n{img_name}:")
        print(f"  True circle radius stats:")
        print(f"    Average radius: {avg_r:.2f}")
        print(f"    Min radius: {min_r:.2f}")
        print(f"    Max radius: {max_r:.2f}")
        print(f"    Standard Deviation of radius: {std_radii:.2f}")
    else:
        print(f"Failed to get {img_name}")
