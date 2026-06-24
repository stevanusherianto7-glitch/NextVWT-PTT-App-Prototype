"""
Mengukur dimensi pixel asli kedua file ikon PNG secara presisi.
Membandingkan ikon single user vs ikon twin user.
"""
from PIL import Image
import os

root = r"C:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone"

paths = {
    "username (single)": os.path.join(root, "src", "imports", "ikon_username1.png"),
    "twin heads (blue)": os.path.join(root, "src", "imports", "ikon_kepala_kembar-2.png"),
}

for label, path in paths.items():
    if not os.path.exists(path):
        print(f"[!] FILE TIDAK DITEMUKAN: {path}")
        continue
    img = Image.open(path)
    w, h = img.size
    mode = img.mode
    ratio = round(w / h, 3) if h else 0
    print(f"\n=== {label} ===")
    print(f"  Path   : {path}")
    print(f"  Size   : {w} x {h} px")
    print(f"  Mode   : {mode}")
    print(f"  Ratio  : {ratio} (w/h)")
    print(f"  KB     : {round(os.path.getsize(path)/1024, 1)} KB")

    # Cek bounding box non-transparan
    if mode == 'RGBA':
        bbox = img.split()[3].getbbox()  # alpha channel bbox
        print(f"  Bbox   : {bbox}")
        if bbox:
            bw = bbox[2] - bbox[0]
            bh = bbox[3] - bbox[1]
            print(f"  Visible: {bw} x {bh} px  (excluding transparent edges)")

print("\n--- Kesimpulan ---")
print("Untuk menyamakan ukuran RENDER ikon single user dengan twin user,")
print("kita perlu menyesuaikan class CSS di LCDPanel.tsx.")
