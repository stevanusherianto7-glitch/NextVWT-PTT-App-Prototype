from rembg import remove
from PIL import Image
import sys

def main():
    input_path = 'src/assets/icon_voice.png'
    output_path = 'src/assets/icon_voice.png'
    
    try:
        input_img = Image.open(input_path)
        output_img = remove(input_img)
        output_img.save(output_path)
        print("Background removed successfully using rembg!")
    except Exception as e:
        print(f"Failed to process image with rembg: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
