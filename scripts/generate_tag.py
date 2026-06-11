import os

def generate_tag_svg():
    # We want a tag pointing top-right.
    # We can rotate a standard tag. A standard tag pointing up:
    # Point at (12, 2), hole at (12, 6)
    # But let's just draw it directly.
    # The attached image is a hollow tag (outline only). The user wants the outline to be blue.
    # Let's use a nice bright blue, e.g., #0088cc or #2196F3.
    
    blue_color = "#2196F3"
    
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g transform="rotate(45 12 12)">
    <!-- The tag pointing UP -->
    <!-- path from bottom-left (7,22) to bottom-right (17,22) to top-right (17,10) to top-center (12,2) to top-left (7,10) -->
    <path d="M 8 22 L 16 22 C 16.55 22 17 21.55 17 21 L 17 10 L 12 2 L 7 10 L 7 21 C 7 21.55 7.45 22 8 22 Z" 
          fill="none" stroke="{blue_color}" stroke-width="2" stroke-linejoin="round"/>
    <!-- The hole -->
    <circle cx="12" cy="7" r="1.5" fill="{blue_color}"/>
  </g>
</svg>"""

    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'assets', 'components', 'icon_tag_baru.svg')
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated tag SVG at {filepath}")

if __name__ == '__main__':
    generate_tag_svg()
