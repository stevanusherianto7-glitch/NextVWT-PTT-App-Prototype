import os

def generate_crown_svg():
    # We will generate a nice golden crown SVG to represent the NOC icon.
    # It has a main gold color and a darker gold outline to make it pop.
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="#FFD700" stroke="#DAA520" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
    <!-- Base of the crown -->
    <rect x="4" y="18" width="16" height="3" rx="1" fill="#FFC107" stroke="#B8860B"/>
    <path d="M5 16 L3 6 L8.5 11 L12 3 L15.5 11 L21 6 L19 16 Z" fill="#FFD700" stroke="#B8860B" />
    <!-- Jewels on the crown tips -->
    <circle cx="3" cy="6" r="1.5" fill="#DC143C" stroke="none" />
    <circle cx="12" cy="3" r="1.5" fill="#DC143C" stroke="none" />
    <circle cx="21" cy="6" r="1.5" fill="#DC143C" stroke="none" />
  </g>
</svg>"""

    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'assets', 'components', 'icon_noc.svg')
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated NOC Crown SVG at {filepath}")

if __name__ == '__main__':
    generate_crown_svg()
