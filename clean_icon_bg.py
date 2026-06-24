from PIL import Image

def remove_white_background(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is white or near-white
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Change the white/near-white to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    input_file = "c:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/assets/icon_voice.png"
    output_file = "c:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/assets/icon_voice.png"
    print(f"Processing {input_file}...")
    remove_white_background(input_file, output_file)
    print("Done!")
