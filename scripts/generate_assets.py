import os
import textwrap

def write_svg(filename, content):
    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'assets', 'components', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated: {filename}")

def svg_header(w, h, title):
    return textwrap.dedent(f"""\
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
      <title>{title}</title>
    """)

PALETTE = {
    'silver_light': '#f0f0f0',
    'silver_mid': '#d0d0d0',
    'silver_dark': '#a0a0a0',
    'shadow': 'rgba(0,0,0,0.5)',
    'highlight': 'rgba(255,255,255,0.8)',
    'green_primary': '#00C853',
    'green_dark': '#008537',
    'red_primary': '#ea4335',
    'red_dark': '#a02316',
    'orange_primary': '#f97316',
    'orange_dark': '#9a3c00',
    'grey_primary': '#5f6368',
    'grey_dark': '#3c4043'
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. BEZEL MAIN FACEPLATE (Mimicking the attached silver image)
# ═══════════════════════════════════════════════════════════════════════════════
def gen_bezel_main_faceplate():
    W, H = 400, 520
    R = 40

    content = svg_header(W, H, "Main Silver Faceplate") + textwrap.dedent(f"""\
      <defs>
        <!-- Main metallic gradient -->
        <linearGradient id="metal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="10%" stop-color="#e2e2e2"/>
          <stop offset="50%" stop-color="#f0f0f0"/>
          <stop offset="90%" stop-color="#c8c8c8"/>
          <stop offset="100%" stop-color="#a0a0a0"/>
        </linearGradient>

        <linearGradient id="metal-border" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#aaaaaa"/>
          <stop offset="100%" stop-color="#666666"/>
        </linearGradient>

        <filter id="inset-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="3"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="blur" result="inv"/>
          <feFlood flood-color="black" flood-opacity="0.5" result="color"/>
          <feComposite operator="in" in="color" in2="inv" result="shadow"/>
          <feMerge>
            <feMergeNode in="SourceGraphic"/>
            <feMergeNode in="shadow"/>
          </feMerge>
        </filter>
        
        <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3"/>
        </filter>

        <!-- Cutout masks -->
        <mask id="cutouts">
          <rect x="0" y="0" width="{W}" height="{H}" fill="white" rx="{R}" ry="{R}"/>
          
          <!-- LCD Cutout -->
          <rect x="30" y="40" width="340" height="200" rx="15" ry="15" fill="black"/>
          
          <!-- Progress Bar Cutout -->
          <rect x="40" y="255" width="320" height="15" rx="7.5" ry="7.5" fill="black"/>
          
          <!-- D-Pad Cutouts -->
          <!-- Connecting trench -->
          <rect x="40" y="340" width="320" height="40" rx="20" ry="20" fill="black"/>
          <!-- Left Button -->
          <rect x="40" y="325" width="100" height="70" rx="35" ry="35" fill="black"/>
          <!-- Center Capsule -->
          <rect x="165" y="295" width="70" height="130" rx="35" ry="35" fill="black"/>
          <!-- Right Button -->
          <rect x="260" y="325" width="100" height="70" rx="35" ry="35" fill="black"/>
        </mask>
      </defs>

      <!-- Outer border -->
      <rect x="5" y="5" width="{W-10}" height="{H-10}" rx="{R}" ry="{R}" fill="url(#metal-border)" filter="url(#drop-shadow)"/>
      
      <!-- Main body with cutouts -->
      <rect x="7" y="7" width="{W-14}" height="{H-14}" rx="{R-2}" ry="{R-2}" fill="url(#metal-bg)" mask="url(#cutouts)"/>

      <!-- LCD Bezel Inner Shadow -->
      <rect x="30" y="40" width="340" height="200" rx="15" ry="15" fill="none" stroke="#666" stroke-width="2" filter="url(#inset-shadow)"/>
      <rect x="30" y="40" width="340" height="200" rx="15" ry="15" fill="none" stroke="#fff" stroke-width="1" transform="translate(0, 1)"/>

      <!-- Progress Bar Bezel Inner Shadow -->
      <rect x="40" y="255" width="320" height="15" rx="7.5" ry="7.5" fill="none" stroke="#666" stroke-width="2" filter="url(#inset-shadow)"/>
      <rect x="40" y="255" width="320" height="15" rx="7.5" ry="7.5" fill="none" stroke="#fff" stroke-width="1" transform="translate(0, 1)"/>

      <!-- D-Pad Trench Inner Shadow -->
      <!-- We just outline the entire combined shape -->
      <path d="M 75 325 L 140 325 
               A 35 35 0 0 0 165 295 
               A 35 35 0 0 1 235 295 
               A 35 35 0 0 0 260 325 
               L 325 325 
               A 35 35 0 0 1 325 395 
               L 260 395 
               A 35 35 0 0 0 235 425 
               A 35 35 0 0 1 165 425 
               A 35 35 0 0 0 140 395 
               L 75 395 
               A 35 35 0 0 1 75 325 Z" 
            fill="none" stroke="#666" stroke-width="2" filter="url(#inset-shadow)"/>
            
      <path d="M 75 325 L 140 325 
               A 35 35 0 0 0 165 295 
               A 35 35 0 0 1 235 295 
               A 35 35 0 0 0 260 325 
               L 325 325 
               A 35 35 0 0 1 325 395 
               L 260 395 
               A 35 35 0 0 0 235 425 
               A 35 35 0 0 1 165 425 
               A 35 35 0 0 0 140 395 
               L 75 395 
               A 35 35 0 0 1 75 325 Z" 
            fill="none" stroke="#fff" stroke-width="1" transform="translate(0, 1)"/>
    </svg>
    """)
    write_svg("bezel_main_faceplate.svg", content)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. BEZEL DPAD PLATE (Optional/legacy, keeping just in case)
# ═══════════════════════════════════════════════════════════════════════════════
def gen_bezel_dpad_plate():
    # We will generate a transparent placeholder or legacy plate so imports don't break
    content = svg_header(290, 150, "Empty D-Pad Plate") + "</svg>"
    write_svg("bezel_dpad_plate.svg", content)


# ═══════════════════════════════════════════════════════════════════════════════
# 3. SET BUTTON (Right pill)
# ═══════════════════════════════════════════════════════════════════════════════
def gen_button_set():
    W, H = 85, 50
    content = svg_header(W, H, "Set Button") + textwrap.dedent(f"""\
      <defs>
        <linearGradient id="btn-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a3a3a"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="{W}" height="{H}" rx="25" ry="25" fill="url(#btn-grad)" stroke="#111" stroke-width="2"/>
      <rect x="2" y="2" width="{W-4}" height="{H/2}" rx="23" ry="23" fill="rgba(255,255,255,0.15)"/>
      <text x="{W/2}" y="{H/2 + 6}" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" text-anchor="middle" fill="#ffffff" letter-spacing="0.5">SET</text>
    </svg>
    """)
    write_svg("btn_set.svg", content)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. DPAD UP / DOWN (Half-capsule shapes)
# ═══════════════════════════════════════════════════════════════════════════════
def gen_button_up():
    W, H = 60, 48
    content = svg_header(W, H, "D-Pad Up") + textwrap.dedent(f"""\
      <defs>
        <linearGradient id="btn-up-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a3a3a"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
      </defs>
      <!-- Half capsule top -->
      <path d="M 0 {H} L 0 30 A 30 30 0 0 1 60 30 L 60 {H} Z" fill="url(#btn-up-grad)" stroke="#111" stroke-width="2"/>
      <!-- Gloss top -->
      <path d="M 2 25 A 28 28 0 0 1 58 25 L 58 {H/2} L 2 {H/2} Z" fill="rgba(255,255,255,0.15)"/>
      <svg x="{W/2 - 14}" y="{H/2 - 10}" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 4L22 20H2L12 4Z" />
      </svg>
    </svg>
    """)
    write_svg("btn_dpad_up.svg", content)

def gen_button_down():
    W, H = 60, 48
    content = svg_header(W, H, "D-Pad Down") + textwrap.dedent(f"""\
      <defs>
        <linearGradient id="btn-down-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a2a2a"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </linearGradient>
      </defs>
      <!-- Half capsule bottom -->
      <path d="M 0 0 L 60 0 L 60 {H-30} A 30 30 0 0 1 0 {H-30} Z" fill="url(#btn-down-grad)" stroke="#111" stroke-width="2"/>
      <svg x="{W/2 - 14}" y="{H/2 - 14}" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12 20L2 4H22L12 20Z" />
      </svg>
    </svg>
    """)
    write_svg("btn_dpad_down.svg", content)


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PTT BUTTONS (Using previous design, just regenerating them)
# ═══════════════════════════════════════════════════════════════════════════════
def pill_button(sym_id, BW, BH, BR, bg_grad, glow_color, text, text_color="#ffffff", border_color="#000"):
    return textwrap.dedent(f"""\
      <symbol id="{sym_id}" viewBox="0 0 {BW} {BH}">
        <rect x="0" y="0" width="{BW}" height="{BH}" rx="{BR}" ry="{BR}"
              fill="rgba(0,0,0,0.12)"
              style="filter:drop-shadow(inset 0 6px 10px rgba(0,0,0,0.45))"/>
        <rect x="6" y="4" width="{BW-12}" height="{BH-8}" rx="{BR-4}" ry="{BR-4}"
              fill="{bg_grad}" stroke="{border_color}" stroke-width="1"/>
        <rect x="8" y="5" width="{BW-16}" height="{BH//3}" rx="{BR-6}" ry="{BR-6}"
              fill="rgba(255,255,255,0.4)" opacity="0.9"/>
        <rect x="6" y="4" width="{BW-12}" height="{BH-8}" rx="{BR-4}" ry="{BR-4}"
              fill="none" stroke="{glow_color}" stroke-width="1.5" opacity="0.3"/>
        <text x="{BW//2}" y="{BH//2 + 16}"
              font-family="'Outfit', 'Arial Black', sans-serif"
              font-size="44" font-weight="800" letter-spacing="3"
              text-anchor="middle" fill="{text_color}"
              style="text-shadow:1px 1px 3px rgba(0,0,0,0.4)">{text}</text>
      </symbol>
    """)

def gen_ptt_buttons():
    W, H = 360, 130
    BW, BH, BR = 326, 96, 48

    defs = f"""
      <defs>
        <linearGradient id="grad-idle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="{PALETTE['green_primary']}"/>
          <stop offset="100%" stop-color="{PALETTE['green_dark']}"/>
        </linearGradient>
        <linearGradient id="grad-active" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="{PALETTE['red_primary']}"/>
          <stop offset="100%" stop-color="{PALETTE['red_dark']}"/>
        </linearGradient>
        <linearGradient id="grad-busy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="{PALETTE['orange_primary']}"/>
          <stop offset="100%" stop-color="{PALETTE['orange_dark']}"/>
        </linearGradient>
        <linearGradient id="grad-off" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="{PALETTE['grey_primary']}"/>
          <stop offset="100%" stop-color="{PALETTE['grey_dark']}"/>
        </linearGradient>
        {pill_button("btn-idle", BW, BH, BR, "url(#grad-idle)", "#00ff66", "PUSH TO TALK")}
        {pill_button("btn-active", BW, BH, BR, "url(#grad-active)", "#ff3333", "TRANSMITTING")}
        {pill_button("btn-busy", BW, BH, BR, "url(#grad-busy)", "#ffaa00", "RECEIVING")}
        {pill_button("btn-off", BW, BH, BR, "url(#grad-off)", "#ffffff", "POWER OFF", "#aaa")}
      </defs>
    """

    for state, ref in [("idle", "btn-idle"), ("active", "btn-active"), ("busy", "btn-busy"), ("off", "btn-off")]:
        content = svg_header(W, H, f"PTT {state.upper()}") + defs + f'<use href="#{ref}" x="17" y="17" /></svg>'
        write_svg(f"btn_ptt_{state}.svg", content)

if __name__ == '__main__':
    gen_bezel_main_faceplate()
    gen_bezel_dpad_plate()
    gen_button_set()
    gen_button_up()
    gen_button_down()
    gen_ptt_buttons()
    print("All requested components generated successfully.")
