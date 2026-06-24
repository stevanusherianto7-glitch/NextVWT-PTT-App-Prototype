from PIL import Image
import math
import sys

def process_mic():
    try:
        img = Image.open('src/assets/vintage_mic.jpg').convert('RGBA')
        data = img.load()
        width, height = img.size

        # We will keep a circular region in the center, and make the rest transparent.
        # Also remove light/checkerboard background colors if needed.
        center_x = width / 2
        center_y = height / 2
        radius = min(center_x, center_y) * 0.95

        for y in range(height):
            for x in range(width):
                r, g, b, a = data[x, y]
                # Distance from center
                dist = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                
                # Make pixels outside the circle transparent
                if dist > radius:
                    data[x, y] = (r, g, b, 0)
                else:
                    # Remove checkerboard (white and grey)
                    # Checkerboard is usually #FFFFFF and #CCCCCC
                    if r > 180 and g > 180 and b > 180 and abs(r-g) < 15 and abs(g-b) < 15:
                        data[x, y] = (r, g, b, 0)
        
        img.save('src/assets/vintage_mic.png')
        print("Successfully processed and saved as vintage_mic.png")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    process_mic()
