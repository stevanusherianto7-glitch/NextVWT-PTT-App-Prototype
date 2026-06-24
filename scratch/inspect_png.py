import os
from PIL import Image

kumpulan_dir = r"c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\kumpulan_icon"
assets_dir = r"c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\src\assets"
images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]

print("--- Inspecting Kumpulan Icon ---")
for img_name in images:
    path = os.path.join(kumpulan_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path)
        print(f"{img_name}: size={img.size}, mode={img.mode}, format={img.format}")
        # check alpha channel
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            # count transparent pixels
            rgba = img.convert("RGBA")
            data = list(rgba.getdata())
            transparent_count = sum(1 for p in data if p[3] < 255)
            print(f"  Transparent pixels: {transparent_count} / {len(data)}")
        else:
            print("  No transparency channel")
    else:
        print(f"{img_name} does not exist in kumpulan_icon")

print("\n--- Inspecting Src Assets ---")
for img_name in images:
    path = os.path.join(assets_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path)
        print(f"{img_name}: size={img.size}, mode={img.mode}, format={img.format}")
        # check alpha channel
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            rgba = img.convert("RGBA")
            data = list(rgba.getdata())
            transparent_count = sum(1 for p in data if p[3] < 255)
            print(f"  Transparent pixels: {transparent_count} / {len(data)}")
        else:
            print("  No transparency channel")
    else:
        print(f"{img_name} does not exist in src/assets")
