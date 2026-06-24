import os
from PIL import Image

kumpulan_dir = r"c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\kumpulan_icon"
images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]

for img_name in images:
    path = os.path.join(kumpulan_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        width, height = img.size
        
        # Find bounds of non-transparent pixels (alpha > 0)
        min_x, min_y = width, height
        max_x, max_y = -1, -1
        
        # Find bounds of opaque pixels (alpha == 255)
        min_ox, min_oy = width, height
        max_ox, max_oy = -1, -1
        
        # Find pixels that are white or near white (R,G,B >= 240) and opaque
        near_white_opaque = 0
        
        for x in range(width):
            for y in range(height):
                r, g, b, a = img.getpixel((x, y))
                if a > 0:
                    min_x = min(min_x, x)
                    min_y = min(min_y, y)
                    max_x = max(max_x, x)
                    max_y = max(max_y, y)
                if a == 255:
                    min_ox = min(min_ox, x)
                    min_oy = min(min_oy, y)
                    max_ox = max(max_ox, x)
                    max_oy = max(max_oy, y)
                    if r >= 240 and g >= 240 and b >= 240:
                        near_white_opaque += 1
                        
        print(f"\n{img_name}:")
        print(f"  Dimensions: {width}x{height}")
        print(f"  Alpha > 0 Bounds: X: [{min_x}, {max_x}] (width={max_x - min_x + 1}), Y: [{min_y}, {max_y}] (height={max_y - min_y + 1})")
        print(f"  Alpha == 255 Bounds: X: [{min_ox}, {max_ox}] (width={max_ox - min_ox + 1}), Y: [{min_oy}, {max_oy}] (height={max_oy - min_oy + 1})")
        print(f"  Near-white opaque pixels (>=240): {near_white_opaque}")
