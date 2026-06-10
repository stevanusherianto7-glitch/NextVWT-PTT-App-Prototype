import subprocess
import io
import time
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"

def run_flood_fill_fast(img, threshold):
    width, height = img.size
    pixels = img.load()
    
    # 2D list of booleans for visited
    visited = [[False] * height for _ in range(width)]
    
    # Corners to start
    queue = []
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for x, y in corners:
        visited[x][y] = True
        queue.append((x, y))
        
    head = 0
    bg_count = len(queue)
    
    while head < len(queue):
        cx, cy = queue[head]
        head += 1
        
        # 4-connectivity
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[nx][ny]:
                    r, g, b = pixels[nx, ny]
                    if r >= threshold and g >= threshold and b >= threshold:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
                        bg_count += 1
                        
    return bg_count

for img_name in images:
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode == 0:
        data = res.stdout
        img = Image.open(io.BytesIO(data)).convert("RGB")
        width, height = img.size
        total_pixels = width * height
        
        print(f"\n{img_name} ({width}x{height}, total={total_pixels}):")
        t0 = time.time()
        for th in [225, 230, 235, 238, 240, 245]:
            bg_count = run_flood_fill_fast(img, th)
            fg_count = total_pixels - bg_count
            fg_percent = (fg_count / total_pixels) * 100
            print(f"  Threshold {th}: BG={bg_count}, FG={fg_count} ({fg_percent:.2f}%)")
        print(f"  Completed in {time.time() - t0:.2f}s")
    else:
        print(f"Failed to get {img_name}")
