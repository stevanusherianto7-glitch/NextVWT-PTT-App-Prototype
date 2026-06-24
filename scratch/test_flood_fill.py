import subprocess
import io
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"

def run_flood_fill(img, threshold):
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for x, y in queue:
        visited.add((x, y))
        
    head = 0
    while head < len(queue):
        cx, cy = queue[head]
        head += 1
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    r, g, b = pixels[nx, ny]
                    if r >= threshold and g >= threshold and b >= threshold:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    return len(visited)

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode == 0:
        img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
        width, height = img.size
        total_pixels = width * height
        
        print(f"\n{img_name} ({width}x{height}, total={total_pixels}):")
        for th in [225, 230, 235, 238, 240, 245]:
            bg_count = run_flood_fill(img, th)
            fg_count = total_pixels - bg_count
            fg_percent = (fg_count / total_pixels) * 100
            print(f"  Threshold {th}: BG={bg_count}, FG={fg_count} ({fg_percent:.2f}%)")
    else:
        print(f"Failed to get {img_name}")
