import subprocess
import io
import time
from PIL import Image

images = ["icon_moderator.png", "icon_operator_otomatis.png", "icon_voice.png"]
commit = "7c8e720e1a19c7e5708aa2c7b5c43aa8cf7eb695"
threshold = 238

try:
    resample_filter = Image.Resampling.LANCZOS
except AttributeError:
    resample_filter = Image.ANTIALIAS

for img_name in images:
    t0 = time.time()
    git_path = f"{commit}:src/assets/{img_name}"
    res = subprocess.run(["git", "show", git_path], capture_output=True)
    if res.returncode != 0:
        print(f"Failed to get {img_name} from git: {res.stderr.decode('utf-8', errors='ignore')}")
        continue
        
    # Load original image
    img = Image.open(io.BytesIO(res.stdout)).convert("RGB")
    width, height = img.size
    pixels = img.load()
    
    # 1. Flood fill to find outer background
    visited = [[False] * height for _ in range(width)]
    mask = [[2] * height for _ in range(width)] # default 2 = foreground
    
    # Queue for background BFS
    bg_queue = []
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for x, y in corners:
        visited[x][y] = True
        mask[x][y] = 1 # 1 = background
        bg_queue.append((x, y))
        
    head = 0
    while head < len(bg_queue):
        cx, cy = bg_queue[head]
        head += 1
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if not visited[nx][ny]:
                    r, g, b = pixels[nx, ny]
                    if r >= threshold and g >= threshold and b >= threshold:
                        visited[nx][ny] = True
                        mask[nx][ny] = 1
                        bg_queue.append((nx, ny))
                        
    print(f"[{img_name}] Step 1: Flood fill completed. BG pixels: {len(bg_queue)}")
    
    # 2. Perform color dilation to prevent white bleeding at the edges
    padded_pixels = [[pixels[x, y] for y in range(height)] for x in range(width)]
    color_queue = []
    color_visited = [[False] * height for _ in range(width)]
    
    # Initialize color dilation queue with border foreground pixels
    for x in range(width):
        for y in range(height):
            if mask[x][y] == 2: # foreground
                color_visited[x][y] = True
                # Check if it has a background neighbor
                is_border = False
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if mask[nx][ny] == 1:
                            is_border = True
                            break
                if is_border:
                    color_queue.append((x, y))
                    
    # BFS to dilate foreground colors into the background
    max_dilation_steps = 15
    dilation_step = 0
    dilated_count = 0
    
    while color_queue and dilation_step < max_dilation_steps:
        next_level = []
        for cx, cy in color_queue:
            color = padded_pixels[cx][cy]
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if not color_visited[nx][ny] and mask[nx][ny] == 1:
                        color_visited[nx][ny] = True
                        padded_pixels[nx][ny] = color
                        next_level.append((nx, ny))
                        dilated_count += 1
        color_queue = next_level
        dilation_step += 1
        
    print(f"[{img_name}] Step 2: Color dilation completed. Dilated {dilated_count} pixels in {dilation_step} steps.")
    
    # 3. Create RGBA image
    rgba_img = Image.new("RGBA", (width, height))
    rgba_pixels = rgba_img.load()
    for x in range(width):
        for y in range(height):
            r, g, b = padded_pixels[x][y]
            a = 255 if mask[x][y] == 2 else 0
            rgba_pixels[x, y] = (r, g, b, a)
            
    # 4. Downsample to 64x64 using Lanczos filter
    resized_img = rgba_img.resize((64, 64), resample=resample_filter)
    
    # 5. Save the image to src/assets/
    out_path = f"c:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\assets\\{img_name}"
    resized_img.save(out_path, "PNG")
    print(f"[{img_name}] Step 3: Resized and saved to {out_path} (time taken: {time.time() - t0:.2f}s)")
