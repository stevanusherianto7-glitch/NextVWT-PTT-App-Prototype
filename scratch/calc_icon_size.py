"""
Hitung ukuran CSS presisi agar ikon single user (usernameIcon)
terlihat sama besar dengan ikon twin user (twinHeadsIcon).

Data dari pengukuran:
- username  PNG: 960x1072, visible bbox: 579x576 px (rasio 0.896)
- twin head PNG: 960x1072, visible bbox: 778x771 px (rasio 0.896)

Twin head di-render: h-[52px] w-[50px]
-> visible content twin  : 771px tinggi dalam 1072px canvas = 71.9% dari canvas
-> 52px * 1072/771 → canvas height dipakai = 52 / (771/1072) = 52 / 0.719 = 72.3px canvas

Untuk single user icon agar visible content = 52px tinggi:
- visible content single : 576px dalam 1072px canvas = 53.7% dari canvas
- canvas height perlu     : 52 / (576/1072) = 52 / 0.537 = 96.8px → dibulatkan 97px
- canvas width perlu      : 97 * 0.896       = 86.9px → dibulatkan 87px

Tapi kita render dgn `object-contain`, jadi kita set h dan w = canvas size.
Mari hitung berdasarkan visible pixel height yang ingin sama:
"""

# Dimensi PNG
canvas_w, canvas_h = 960, 1072

# Visible bbox per ikon
twin_vis_w, twin_vis_h = 778, 771
single_vis_w, single_vis_h = 579, 576

# Twin head: render target
twin_render_h = 52  # px CSS
twin_render_w = 50  # px CSS

# Rasio visible-to-canvas (height)
twin_vis_ratio   = twin_vis_h   / canvas_h   # 0.719
single_vis_ratio = single_vis_h / canvas_h   # 0.537

# Visible height of twin icon in rendered pixels
twin_visible_render_h = twin_render_h * twin_vis_ratio

print(f"Twin visible height in render  : {twin_visible_render_h:.2f}px CSS")
print(f"  (twin_vis_ratio: {twin_vis_ratio:.4f})")
print()

# To make single icon visible height equal to twin's:
# single_render_h * single_vis_ratio = twin_visible_render_h
single_render_h_needed = twin_visible_render_h / single_vis_ratio
single_render_w_needed = single_render_h_needed * (canvas_w / canvas_h)

print(f"Single vis ratio               : {single_vis_ratio:.4f}")
print(f"Required single render height  : {single_render_h_needed:.2f}px -> round to {round(single_render_h_needed)}px")
print(f"Required single render width   : {single_render_w_needed:.2f}px -> round to {round(single_render_w_needed)}px")
print()

# Verify
actual_single_vis_h = round(single_render_h_needed) * single_vis_ratio
print(f"Verification: single visible at {round(single_render_h_needed)}px render = {actual_single_vis_h:.1f}px (target: {twin_visible_render_h:.1f}px)")
print()

# Also check top offset adjustment (icon uses absolute -top-[?]px)
# Current: h-[52px] w-[50px] absolute -top-[14px] left-0
# New render height = X, center should be same visual position
# Container is w-[38px] h-[38px]
# -top offset = (new_h - 38) / 2 approx? 
# Current: 52-38=14 → -top-[14px] — makes sense
new_h = round(single_render_h_needed)
new_w = round(single_render_w_needed)
container_h = 38
new_top_offset = round((new_h - container_h) / 2)

print(f"Container h       : {container_h}px")
print(f"New render size   : w-[{new_w}px] h-[{new_h}px]")
print(f"Top offset needed : -top-[{new_top_offset}px] (was -top-[14px])")
print()
print("=== FINAL CSS FIX ===")
print(f"Change from: 'h-[52px] w-[50px] object-contain absolute -top-[14px] left-0'")
print(f"Change to  : 'h-[{new_h}px] w-[{new_w}px] object-contain absolute -top-[{new_top_offset}px] left-0'")
