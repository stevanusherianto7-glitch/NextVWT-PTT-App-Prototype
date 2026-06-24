import math

def generate_dpad_path(fillet_r=12):
    # Base dimensions
    cx = 145
    cy_top = 30
    cy_bot = 120
    R = 45
    
    # Fillet calculations for top-right corner
    # Top circle C1: (cx, cy_top), R
    # Right line: Y = cy_top
    # Fillet circle Cf_tr: tangent to C1 and Y=cy_top.
    # Center of Cf_tr: Yc = cy_top - fillet_r
    # Distance to C1: (Xc - cx)^2 + (-fillet_r)^2 = (R + fillet_r)^2
    # Xc = cx + sqrt(R^2 + 2*R*fillet_r)
    
    dx = math.sqrt(R**2 + 2*R*fillet_r)
    
    # Top Right Fillet Center
    xc_tr = cx + dx
    yc_tr = cy_top - fillet_r
    
    # Tangent points for Top-Right Fillet
    # Tangent to horizontal line: (xc_tr, cy_top)
    pt_tr_line = (xc_tr, cy_top)
    # Tangent to C1:
    # vector from C1 to Cf_tr is (dx, -fillet_r)
    # distance is R + fillet_r
    # pt_tr_circle = C1 + (vector) * (R / (R + fillet_r))
    ratio = R / (R + fillet_r)
    pt_tr_circle = (cx + dx * ratio, cy_top - fillet_r * ratio)
    
    # Symmetry allows us to find all other points easily!
    # Top Left Fillet
    xc_tl = cx - dx
    yc_tl = cy_top - fillet_r
    pt_tl_line = (xc_tl, cy_top)
    pt_tl_circle = (cx - dx * ratio, cy_top - fillet_r * ratio)
    
    # Bottom Right Fillet
    xc_br = cx + dx
    yc_br = cy_bot + fillet_r
    pt_br_line = (xc_br, cy_bot)
    pt_br_circle = (cx + dx * ratio, cy_bot + fillet_r * ratio)
    
    # Bottom Left Fillet
    xc_bl = cx - dx
    yc_bl = cy_bot + fillet_r
    pt_bl_line = (xc_bl, cy_bot)
    pt_bl_circle = (cx - dx * ratio, cy_bot + fillet_r * ratio)
    
    # The SVG Path!
    # Start at Top Left tangent point on the top circle
    path = []
    path.append(f"M {pt_tl_circle[0]:.2f} {pt_tl_circle[1]:.2f}")
    
    # 1. Arc around Top Circle to Top Right tangent point
    path.append(f"A {R} {R} 0 0 1 {pt_tr_circle[0]:.2f} {pt_tr_circle[1]:.2f}")
    
    # 2. Fillet at Top Right (sweep-flag 0 because it's an inner curve, turning right)
    path.append(f"A {fillet_r} {fillet_r} 0 0 0 {pt_tr_line[0]:.2f} {pt_tr_line[1]:.2f}")
    
    # 3. Line to Right Circle top
    path.append(f"L 245 30")
    
    # 4. Arc around Right Circle
    path.append(f"A {R} {R} 0 0 1 245 120")
    
    # 5. Line to Bottom Right fillet tangent point
    path.append(f"L {pt_br_line[0]:.2f} {pt_br_line[1]:.2f}")
    
    # 6. Fillet at Bottom Right (inner curve, turning right)
    path.append(f"A {fillet_r} {fillet_r} 0 0 0 {pt_br_circle[0]:.2f} {pt_br_circle[1]:.2f}")
    
    # 7. Arc around Bottom Circle
    path.append(f"A {R} {R} 0 0 1 {pt_bl_circle[0]:.2f} {pt_bl_circle[1]:.2f}")
    
    # 8. Fillet at Bottom Left
    path.append(f"A {fillet_r} {fillet_r} 0 0 0 {pt_bl_line[0]:.2f} {pt_bl_line[1]:.2f}")
    
    # 9. Line to Left Circle bottom
    path.append(f"L 45 120")
    
    # 10. Arc around Left Circle
    path.append(f"A {R} {R} 0 0 1 45 30")
    
    # 11. Line to Top Left fillet tangent point
    path.append(f"L {pt_tl_line[0]:.2f} {pt_tl_line[1]:.2f}")
    
    # 12. Fillet at Top Left
    path.append(f"A {fillet_r} {fillet_r} 0 0 0 {pt_tl_circle[0]:.2f} {pt_tl_circle[1]:.2f}")
    
    path.append("Z")
    
    return " ".join(path)

print(generate_dpad_path(14))
