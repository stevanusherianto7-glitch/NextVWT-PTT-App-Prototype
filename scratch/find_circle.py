import os
import math
from PIL import Image

kumpulan_dir = r"c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\kumpulan_icon"
images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]

for img_name in images:
    path = os.path.join(kumpulan_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        width, height = img.size
        
        # Scan from corners and edges to find the boundary of the non-white shape
        boundary_points = []
        
        # We scan in 360 directions from the center
        cx, cy = width / 2.0, height / 2.0
        
        # Let's find the radius for 360 angles
        radii = []
        for angle_deg in range(0, 360, 5):
            angle = math.radians(angle_deg)
            dx = math.cos(angle)
            dy = math.sin(angle)
            
            # Start from outer edge and scan inward
            max_r = min(cx, cy) * 1.2
            r = max_r
            found = False
            while r > 0:
                x = int(cx + r * dx)
                y = int(cy + r * dy)
                if 0 <= x < width and 0 <= y < height:
                    pr, pg, pb, pa = img.getpixel((x, y))
                    # check if not white
                    dist_from_white = 255 - min(pr, pg, pb)
                    if dist_from_white > 15 and pa > 10:
                        radii.append(r)
                        boundary_points.append((x, y))
                        found = True
                        break
                r -= 0.5
        
        if radii:
            avg_r = sum(radii) / len(radii)
            min_r = min(radii)
            max_r = max(radii)
            print(f"\n{img_name}:")
            print(f"  Center estimate: ({cx}, {cy})")
            print(f"  Radius estimate: avg={avg_r:.2f}, min={min_r:.2f}, max={max_r:.2f}")
            print(f"  Radius deviation: {max_r - min_r:.2f} pixels")
        else:
            print(f"\n{img_name}: No circular boundary found (already transparent or empty)")
