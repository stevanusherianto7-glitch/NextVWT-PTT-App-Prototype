import os
import numpy as np
from PIL import Image
from skimage.measure import label, regionprops
from scipy.ndimage import distance_transform_edt

input_path = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\e20f5104-4c23-4d49-adce-5d66f99860a3\media__1782288009562.jpg"
output_dir = "src/assets"

icon_names = [
    'icon_moderator.png',
    'icon_operator.png',
    'icon_voice.png',
    'icon_controlled.png',
    'icon_wait.png',
    'icon_silent.png'
]

img = Image.open(input_path).convert("RGBA")
img_np = np.array(img)

r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
foreground = (r < 240) | (g < 240) | (b < 240)

left_mask = np.zeros_like(foreground)
left_mask[:, 0:130] = True
foreground = foreground & left_mask

labeled = label(foreground)
regions = regionprops(labeled)

valid_regions = [r for r in regions if r.area > 100]
valid_regions.sort(key=lambda r: r.area, reverse=True)
top_6 = valid_regions[:6]
top_6.sort(key=lambda r: r.bbox[0])

for i, region in enumerate(top_6):
    if i >= len(icon_names): break
    name = icon_names[i]
    min_row, min_col, max_row, max_col = region.bbox
    
    pad = 4
    min_row = max(0, min_row - pad)
    min_col = max(0, min_col - pad)
    max_row = min(img_np.shape[0], max_row + pad)
    max_col = min(img_np.shape[1], max_col + pad)
    
    cropped_np = img_np[min_row:max_row, min_col:max_col].copy()
    
    c_r = cropped_np[:,:,0].astype(float)
    c_g = cropped_np[:,:,1].astype(float)
    c_b = cropped_np[:,:,2].astype(float)
    
    # Calculate distance to white to estimate alpha
    # Use max of color channels difference from 255. 
    # Because a dark pixel has high difference.
    diff_r = 255 - c_r
    diff_g = 255 - c_g
    diff_b = 255 - c_b
    max_diff = np.maximum.reduce([diff_r, diff_g, diff_b])
    
    # Thresholds for alpha: 
    # If max_diff < 15, it's very close to white -> alpha 0
    # If max_diff > 60, it's solid color -> alpha 255
    alpha_mask = np.clip((max_diff - 15) * (255 / 45), 0, 255).astype(np.uint8)
    
    solid_mask = alpha_mask == 255
    if not np.any(solid_mask):
        solid_mask = alpha_mask > 200
        
    dist, indices = distance_transform_edt(~solid_mask, return_indices=True)
    
    nearest_y = indices[0]
    nearest_x = indices[1]
    
    clean_r = c_r[nearest_y, nearest_x]
    clean_g = c_g[nearest_y, nearest_x]
    clean_b = c_b[nearest_y, nearest_x]
    
    cropped_np[:,:,0] = clean_r
    cropped_np[:,:,1] = clean_g
    cropped_np[:,:,2] = clean_b
    cropped_np[:,:,3] = alpha_mask
    
    out_img = Image.fromarray(cropped_np.astype(np.uint8))
    out_path = os.path.join(output_dir, name)
    out_img.save(out_path)
    print(f"Extracted perfectly clean {name}")

wait_path = os.path.join(output_dir, 'icon_wait.png')
wait_ctrl_path = os.path.join(output_dir, 'icon_wait_controlled.png')
img = Image.open(wait_path).convert('RGBA')
data = np.array(img)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
blue_mask = (b > r) & (a > 0)
new_data = data.copy()
new_data[blue_mask, 0] = b[blue_mask]
new_data[blue_mask, 2] = r[blue_mask]
Image.fromarray(new_data).save(wait_ctrl_path)
print("Generated perfect icon_wait_controlled.png")
