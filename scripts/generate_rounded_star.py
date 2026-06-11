import os
import math

def generate_rounded_star_svg(filename):
    # Colors for "light maroon"
    dark_maroon = "#701515"
    base_maroon = "#A03030"
    light_maroon = "#D05050"
    highlight = "#E57070"

    # SVG content with gradients and stacked paths to create a 3D rounded effect
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <!-- Main body gradient -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{light_maroon}" />
      <stop offset="100%" stop-color="{base_maroon}" />
    </linearGradient>
    
    <!-- Inner highlight gradient -->
    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{highlight}" />
      <stop offset="100%" stop-color="{light_maroon}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- The path of a 5-pointed star -->
  <!-- We use stroke-linejoin="round" to make the corners rounded -->
  <g transform="translate(50, 53)">
    <!-- Outer thick stroke for the border -->
    <path d="M 0 -35 L 11 -12 L 36 -8 L 18 10 L 22 35 L 0 23 L -22 35 L -18 10 L -36 -8 L -11 -12 Z" 
          fill="none" 
          stroke="{dark_maroon}" 
          stroke-width="12" 
          stroke-linejoin="round" />
          
    <!-- Main fill with gradient -->
    <path d="M 0 -35 L 11 -12 L 36 -8 L 18 10 L 22 35 L 0 23 L -22 35 L -18 10 L -36 -8 L -11 -12 Z" 
          fill="url(#starGrad)" 
          stroke="url(#starGrad)" 
          stroke-width="8" 
          stroke-linejoin="round" />

    <!-- Inner highlight for 3D bevel effect -->
    <path d="M 0 -35 L 11 -12 L 36 -8 L 18 10 L 22 35 L 0 23 L -22 35 L -18 10 L -36 -8 L -11 -12 Z" 
          fill="none" 
          stroke="url(#highlightGrad)" 
          stroke-width="3" 
          stroke-linejoin="round" 
          transform="scale(0.85)" />
  </g>
</svg>"""

    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'assets', 'components', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated {filename} at {filepath}")

if __name__ == '__main__':
    generate_rounded_star_svg('icon_star_noc.svg')
