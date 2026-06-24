import os

def generate_star_svg(color, filename):
    # A standard 5-point star SVG
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        fill="{color}" stroke="#888888" stroke-width="1.5" stroke-linejoin="round"/>
</svg>"""

    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'assets', 'components', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated {filename} at {filepath}")

if __name__ == '__main__':
    generate_star_svg('#800000', 'icon_star_noc.svg')       # Maroon for NOC
    generate_star_svg('#FFFFFF', 'icon_star_operator.svg')  # White for Operator
