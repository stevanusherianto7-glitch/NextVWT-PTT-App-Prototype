from rembg import remove
from PIL import Image

def main():
    input_path = 'src/assets/red_mic_generated.png'
    output_path = 'src/assets/vintage_mic.png'
    
    input_img = Image.open(input_path)
    output_img = remove(input_img)
    output_img.save(output_path)
    print("Background removed successfully using rembg!")

if __name__ == '__main__':
    main()
