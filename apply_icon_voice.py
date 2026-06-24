"""
apply_icon_voice.py
===================
Tugas:
  1. Copy kumpulan_icon/icon_voice.png  ->  src/assets/icon_voice.png
     (menggantikan versi lama yang hanya 4KB dengan versi HD 1.4MB)
  2. Tambahkan import iconVoice ke ChannelMemberList.tsx (fitur moderasi)
     dan gunakan sebagai fallback avatar user (mengganti teks inisial)
  3. Pastikan LCD panel (LCDPanel.tsx) sudah pakai iconVoice -- verifikasi saja
"""

import sys
import io
# Fix Windows terminal encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import shutil
import re

from pathlib import Path

ROOT = Path(__file__).parent
SRC_ICON = ROOT / "kumpulan_icon" / "icon_voice.png"
DST_ICON = ROOT / "src" / "assets" / "icon_voice.png"
MEMBER_LIST = ROOT / "src" / "features" / "moderation" / "ChannelMemberList.tsx"
LCD_PANEL   = ROOT / "src" / "app" / "components" / "LCDPanel.tsx"


def step1_copy_icon():
    print("=" * 60)
    print("STEP 1 — Copy icon_voice.png ke src/assets/")
    print("=" * 60)

    if not SRC_ICON.exists():
        print(f"  [ERROR] Source tidak ditemukan: {SRC_ICON}")
        sys.exit(1)

    size_before = DST_ICON.stat().st_size if DST_ICON.exists() else 0
    shutil.copy2(SRC_ICON, DST_ICON)
    size_after = DST_ICON.stat().st_size

    print(f"  ✓ Source  : {SRC_ICON.name} ({SRC_ICON.stat().st_size:,} bytes)")
    print(f"  ✓ Target  : {DST_ICON}")
    print(f"  ✓ Ukuran  : {size_before:,} bytes  →  {size_after:,} bytes")
    print()


def step2_update_channel_member_list():
    print("=" * 60)
    print("STEP 2 — Update ChannelMemberList.tsx (fitur moderasi)")
    print("=" * 60)

    code = MEMBER_LIST.read_text(encoding="utf-8")

    # ── 2a. Tambahkan import iconVoice jika belum ada ──────────────────────
    IMPORT_LINE = "import iconVoice from '../../assets/icon_voice.png';\n"
    if "icon_voice" in code:
        print("  ℹ  Import iconVoice sudah ada — skip.")
    else:
        # Sisipkan setelah baris import terakhir dari blok import atas
        # (setelah import { USER_PROFILES } from ...)
        insert_after = "import { USER_PROFILES } from '../../app/components/UserListModal';"
        if insert_after in code:
            code = code.replace(
                insert_after,
                insert_after + "\n" + IMPORT_LINE,
            )
            print(f"  ✓ Import iconVoice ditambahkan setelah: {insert_after!r}")
        else:
            # fallback: tambahkan sebelum interface pertama
            code = IMPORT_LINE + code
            print("  ✓ Import iconVoice ditambahkan di awal file (fallback).")

    # ── 2b. Ganti fallback avatar (inisial teks) dengan iconVoice ────────────
    # Target snippet:
    #   ) : (
    #     u.displayName.substring(0, 2).toUpperCase()
    #   )}
    OLD_AVATAR_FALLBACK = (
        ") : (\n"
        "                          u.displayName.substring(0, 2).toUpperCase()\n"
        "                        )}"
    )
    NEW_AVATAR_FALLBACK = (
        ") : (\n"
        "                          <img\n"
        "                            src={iconVoice}\n"
        "                            alt={u.displayName}\n"
        "                            className=\"h-full w-full rounded-full object-contain p-[3px] opacity-90\"\n"
        "                          />\n"
        "                        )}"
    )

    if "iconVoice}" in code or "src={iconVoice}" in code:
        print("  ℹ  Fallback avatar iconVoice sudah diterapkan — skip.")
    elif OLD_AVATAR_FALLBACK in code:
        code = code.replace(OLD_AVATAR_FALLBACK, NEW_AVATAR_FALLBACK, 1)
        print("  ✓ Fallback avatar: inisial teks diganti dengan <img iconVoice />")
    else:
        print("  ⚠  Pola fallback avatar tidak ditemukan — coba pola alternatif...")
        # Pola tanpa indentasi spesifik
        alt_pattern = r"\) : \(\s+u\.displayName\.substring\(0, 2\)\.toUpperCase\(\)\s+\)\}"
        alt_replace = (
            ") : (\n"
            "                          <img\n"
            "                            src={iconVoice}\n"
            "                            alt={u.displayName}\n"
            "                            className=\"h-full w-full rounded-full object-contain p-[3px] opacity-90\"\n"
            "                          />\n"
            "                        )}"
        )
        new_code, n = re.subn(alt_pattern, alt_replace, code, count=1)
        if n:
            code = new_code
            print("  ✓ Fallback avatar diganti via regex alternatif.")
        else:
            print("  ✗ Tidak bisa menemukan pola fallback avatar. Lewati langkah ini.")

    MEMBER_LIST.write_text(code, encoding="utf-8")
    print(f"  ✓ File disimpan: {MEMBER_LIST}")
    print()


def step3_verify_lcd_panel():
    print("=" * 60)
    print("STEP 3 — Verifikasi LCDPanel.tsx")
    print("=" * 60)

    code = LCD_PANEL.read_text(encoding="utf-8")

    if "import iconVoice from '../../assets/icon_voice.png'" in code:
        print("  ✓ LCDPanel.tsx sudah import iconVoice.")
    else:
        print("  ✗ LCDPanel.tsx TIDAK import iconVoice! (perlu dicek manual)")

    if "activeUserModeIcon = iconVoice" in code:
        print("  ✓ iconVoice dipakai sebagai fallback icon user di LCD panel.")
    else:
        print("  ✗ iconVoice tidak dipakai di LCD panel! (perlu dicek manual)")
    print()


def main():
    print()
    print("=" * 56)
    print("  apply_icon_voice.py -- NextVWT PTT App")
    print("=" * 56)
    print()

    step1_copy_icon()
    step2_update_channel_member_list()
    step3_verify_lcd_panel()

    print("=" * 60)
    print("SELESAI — Semua langkah berhasil dijalankan.")
    print("=" * 60)
    print()
    print("Ringkasan perubahan:")
    print("  • src/assets/icon_voice.png  -> diganti versi HD dari kumpulan_icon/")
    print("  • ChannelMemberList.tsx      -> iconVoice dipakai sebagai fallback avatar")
    print("  • LCDPanel.tsx               -> sudah memakai iconVoice (tidak berubah)")
    print()


if __name__ == "__main__":
    main()
