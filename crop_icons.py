from PIL import Image

def crop_to_bbox(img_path):
    img = Image.open(img_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(img_path)
        print(f"Cropped {img_path} to {bbox}")
    else:
        print(f"No bbox found for {img_path}")

crop_to_bbox("src/imports/ikon_username1.png")
crop_to_bbox("src/imports/ikon_kepala_kembar-2.png")
