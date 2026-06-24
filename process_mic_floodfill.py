from PIL import Image
from collections import deque

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = deque()
    
    def is_bg(x, y):
        r, g, b, a = pixels[x, y]
        # checkerboard is white (~255) and gray (~200)
        # allow some jpeg noise
        if r > 230 and g > 230 and b > 230: return True
        if abs(r-200) < 30 and abs(g-200) < 30 and abs(b-200) < 30: return True
        return False

    # Seed from the edges
    for x in range(width):
        if is_bg(x, 0) and (x, 0) not in visited:
            visited.add((x, 0))
            queue.append((x, 0))
        if is_bg(x, height-1) and (x, height-1) not in visited:
            visited.add((x, height-1))
            queue.append((x, height-1))
            
    for y in range(height):
        if is_bg(0, y) and (0, y) not in visited:
            visited.add((0, y))
            queue.append((0, y))
        if is_bg(width-1, y) and (width-1, y) not in visited:
            visited.add((width-1, y))
            queue.append((width-1, y))
            
    print(f"Starting BFS with {len(queue)} edge pixels...")
    
    while queue:
        x, y = queue.popleft()
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg(nx, ny):
                        visited.add((nx, ny))
                        queue.append((nx, ny))

    print(f"Found {len(visited)} background pixels out of {width*height} total.")
    
    for (x, y) in visited:
        pixels[x, y] = (255, 255, 255, 0)
        
    img.save(output_path)
    print("Clean image saved to", output_path)

if __name__ == '__main__':
    process_image('C:/Users/ASUS/.gemini/antigravity-ide/brain/e20f5104-4c23-4d49-adce-5d66f99860a3/media__1782267689378.jpg', 'src/assets/vintage_mic.png')
