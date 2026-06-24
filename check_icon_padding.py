from PIL import Image

def get_bbox(img_path):
    img = Image.open(img_path).convert("RGBA")
    bbox = img.getbbox()
    return img.size, bbox

size1, bbox1 = get_bbox("src/imports/ikon_username1.png")
size2, bbox2 = get_bbox("src/imports/ikon_kepala_kembar-2.png")

print(f"Single user icon: size={size1}, bbox={bbox1}")
print(f"Twin user icon: size={size2}, bbox={bbox2}")
