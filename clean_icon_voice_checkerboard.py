import sys
from PIL import Image

def clean_edges(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We will do a flood fill from the corners.
    from collections import deque
    visited = set()
    queue = deque()
    
    def is_bg(r, g, b):
        # The background is a fake transparency checkerboard (white and light gray)
        # We consider any pixel that is very light gray/white as background
        if r > 230 and g > 230 and b > 230: return True
        # Sometimes the gray might be around 200 or 220
        # The icon itself is blue and dark blue/black.
        # So we can safely consider r > 200 and g > 200 and b > 200 as background
        if r > 180 and g > 180 and b > 180: return True
        return False
        
    for x in range(width):
        if is_bg(*pixels[x, 0][:3]):
            queue.append((x, 0))
            visited.add((x, 0))
        if is_bg(*pixels[x, height-1][:3]):
            queue.append((x, height-1))
            visited.add((x, height-1))
    for y in range(height):
        if is_bg(*pixels[0, y][:3]):
            queue.append((0, y))
            visited.add((0, y))
        if is_bg(*pixels[width-1, y][:3]):
            queue.append((width-1, y))
            visited.add((width-1, y))
            
    bg_pixels = set()
    
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        
        bg_pixels.add((x, y))
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg(*pixels[nx, ny][:3]):
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    # Now we expand the bg_pixels slightly to catch the anti-aliased edge
    edge_pixels = set()
    for (x, y) in bg_pixels:
        for dx in range(-3, 4):
            for dy in range(-3, 4):
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in bg_pixels:
                        edge_pixels.add((nx, ny))
                        
    # For background pixels, make fully transparent
    for (x, y) in bg_pixels:
        pixels[x, y] = (255, 255, 255, 0)
        
    # For edge pixels, blend transparency based on how bright they are
    # The icon has dark edges, so edge pixels should be black/dark blue with some alpha
    for (x, y) in edge_pixels:
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3.0
        
        # If it's very bright, it's mostly background
        if brightness > 120:
            # Map brightness 120..220 to alpha 255..0
            new_a = int(max(0, min(255, (220 - brightness) * 255 / (220 - 120))))
            pixels[x, y] = (r, g, b, new_a)

    img.save(output_path, "PNG")

if __name__ == "__main__":
    # Take the original from kumpulan_icon again because the one in src/assets is now modified
    src_file = "C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/kumpulan_icon/icon_voice.png"
    target_file = "C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/assets/icon_voice.png"
    
    print("Cleaning checkerboard background from HD icon...")
    clean_edges(src_file, target_file)
    print("Done!")
