import os
from PIL import Image

kumpulan_dir = r"c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\kumpulan_icon"
images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]

for img_name in images:
    path = os.path.join(kumpulan_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        width, height = img.size
        # Sample corners
        corners = [
            (0, 0), (width-1, 0), (0, height-1), (width-1, height-1),
            (width//2, 0), (0, height//2), (width-1, height//2), (width//2, height-1)
        ]
        print(f"\n{img_name} corner pixels:")
        for idx, (x, y) in enumerate(corners):
            pixel = img.getpixel((x, y))
            print(f"  Corner {idx} ({x}, {y}): {pixel}")
            
        # Count pixels by transparency
        opaque = 0
        fully_transparent = 0
        semi_transparent = 0
        white_pixels = 0
        for x in range(width):
            for y in range(height):
                r, g, b, a = img.getpixel((x, y))
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
