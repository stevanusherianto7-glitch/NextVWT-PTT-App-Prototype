import os
import numpy as np
from PIL import Image
from skimage.measure import label, regionprops
from skimage.morphology import binary_dilation

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
foreground = (r < 230) | (g < 230) | (b < 230)

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
    
    # We want a sharp edge. 
    # Let's find the background using a simple threshold.
    c_r, c_g, c_b = cropped_np[:,:,0], cropped_np[:,:,1], cropped_np[:,:,2]
    is_white = (c_r > 230) & (c_g > 230) & (c_b > 230)
    
    # Label the white background. The background should touch the borders.
    labeled_bg = label(is_white)
    
    # Find which labels touch the border
    h, w = is_white.shape
    border_labels = set()
    border_labels.update(labeled_bg[0, :])
    border_labels.update(labeled_bg[h-1, :])
    border_labels.update(labeled_bg[:, 0])
    border_labels.update(labeled_bg[:, w-1])
    
    if 0 in border_labels:
        border_labels.remove(0)
        
    true_bg = np.isin(labeled_bg, list(border_labels))
    
    # Dilate the true background by 1 pixel to eat the anti-aliased edge
    # so the remaining icon is sharp and pure.
    true_bg = binary_dilation(true_bg)
    
    # Apply alpha
    cropped_np[true_bg, 3] = 0
    cropped_np[~true_bg, 3] = 255
    
    out_img = Image.fromarray(cropped_np)
    out_path = os.path.join(output_dir, name)
    out_img.save(out_path)

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
