import sys
from PIL import Image

def remove_white_bg_soft(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Distance from white
            # White is 255, 255, 255
            # We want pure white to have alpha 0
            # And anything darker to be solid. 
            # But we only want to do this for the background.
            # Let's do a floodfill to find background pixels, and for pixels near the background, calculate partial alpha.
            pass

def clean_edges(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We will do a flood fill from the corners.
    from collections import deque
    visited = set()
    queue = deque()
    
    def is_white(r, g, b):
        return r > 240 and g > 240 and b > 240
        
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height-1))
        visited.add((x, 0))
        visited.add((x, height-1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width-1, y))
        visited.add((0, y))
        visited.add((width-1, y))
        
    bg_pixels = set()
    
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        
        # If it's near white, it's part of the background
        if is_white(r, g, b):
            bg_pixels.add((x, y))
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    # Now we expand the bg_pixels slightly to catch the anti-aliased edge
    edge_pixels = set()
    for (x, y) in bg_pixels:
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in bg_pixels:
                        edge_pixels.add((nx, ny))
                        
    # For background pixels, make fully transparent
    for (x, y) in bg_pixels:
        pixels[x, y] = (255, 255, 255, 0)
        
    # For edge pixels, blend transparency based on how white they are
    for (x, y) in edge_pixels:
        r, g, b, a = pixels[x, y]
        # white distance: 0 is white, larger is darker
        # avg = (r + g + b) / 3
        # alpha = 255 - avg (so white is 0 alpha, black is 255 alpha)
        # We can map brightness 200..255 to alpha 255..0
        brightness = (r + g + b) / 3.0
        if brightness > 150:
            new_a = int(max(0, min(255, (255 - brightness) * 255 / (255 - 150))))
            pixels[x, y] = (r, g, b, new_a)

    img.save(output_path, "PNG")

if __name__ == "__main__":
    src_file = "C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/kumpulan_icon/icon_voice.png"
    target_file = "C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/assets/icon_voice.png"
    
    print("Cleaning background from HD icon...")
    clean_edges(src_file, target_file)
    print("Done!")
