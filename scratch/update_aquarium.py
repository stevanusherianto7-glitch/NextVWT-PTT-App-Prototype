import re

file_path = r'c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\src\app\components\AquariumCanvas.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import sprite
content = content.replace(
    "import { useRef, useEffect } from 'react';",
    "import { useRef, useEffect } from 'react';\nimport fishSpriteUrl from '../../assets/fish_spritesheet.png';"
)

# 2. Update Fish interface
old_interface = """interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetX: number;
  targetY: number;
  size: number;
  maxSpeed: number;
  wigglePhase: number;
  wiggleSpeed: number;
  type: 'goldfish' | 'betta-blue' | 'neon-tetra' | 'betta-purple';
  color: string;
  accentColor: string;
}"""

new_interface = """interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetX: number;
  targetY: number;
  size: number;
  maxSpeed: number;
  wigglePhase: number;
  wiggleSpeed: number;
  spriteCol: number;
  spriteRow: number;
  facingLeft: boolean;
}"""

content = content.replace(old_interface, new_interface)

# 3. Replace fishList initialization
old_fishlist_match = re.search(r'// --- Initialize Fish ---.*?\];', content, re.DOTALL)
if old_fishlist_match:
    old_fishlist = old_fishlist_match.group(0)
    new_fishlist = """// --- Initialize Fish ---
    const FISH_SPRITES = [
      { col: 0, row: 0, facingLeft: false },
      { col: 1, row: 0, facingLeft: false },
      { col: 2, row: 0, facingLeft: false },
      { col: 0, row: 1, facingLeft: false },
      { col: 1, row: 1, facingLeft: false },
      { col: 2, row: 1, facingLeft: false },
      { col: 0, row: 2, facingLeft: true },
      { col: 1, row: 2, facingLeft: false },
      { col: 2, row: 2, facingLeft: false },
      { col: 0, row: 3, facingLeft: false },
      { col: 1, row: 3, facingLeft: true },
      { col: 2, row: 3, facingLeft: false },
      { col: 0, row: 4, facingLeft: false },
      { col: 1, row: 4, facingLeft: false },
      { col: 2, row: 4, facingLeft: true },
    ];

    const fishList: Fish[] = Array.from({ length: 6 }, (_, i) => {
      const sprite = FISH_SPRITES[Math.floor(Math.random() * FISH_SPRITES.length)];
      return {
        id: i + 1,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 0.5,
        angle: 0,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: 0.15 + Math.random() * 0.1,
        maxSpeed: 0.5 + Math.random() * 0.5,
        wigglePhase: Math.random() * Math.PI * 2,
        wiggleSpeed: 0.1 + Math.random() * 0.15,
        spriteCol: sprite.col,
        spriteRow: sprite.row,
        facingLeft: sprite.facingLeft,
      };
    });

    const fishImage = new Image();
    fishImage.src = fishSpriteUrl;"""
    content = content.replace(old_fishlist, new_fishlist)

# 4. Replace DRAW FISH block
old_draw_match = re.search(r'// --- DRAW FISH ---.*?(?=// 7\. Render Water Ripples)', content, re.DOTALL)
if old_draw_match:
    old_draw = old_draw_match.group(0)
    new_draw = """// --- DRAW FISH ---
        ctx.save();
        ctx.translate(fish.x, fish.y);
        
        // Flip based on velocity and sprite orientation
        let isMovingLeft = fish.vx < 0;
        let shouldFlip = isMovingLeft !== fish.facingLeft;
        
        if (shouldFlip) {
          ctx.scale(-1, 1);
        }

        // Add small rotation based on vy
        ctx.rotate(fish.vy * 0.2 * (shouldFlip ? -1 : 1));

        // Wiggle effect
        const wiggle = Math.sin(fish.wigglePhase) * 0.05;
        ctx.scale(1 + wiggle, 1 - wiggle);
        
        ctx.scale(fish.size, fish.size);

        // 3D Drop Shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 5;

        const srcW = 1024 / 3;
        const srcH = 1024 / 5;
        const srcX = fish.spriteCol * srcW;
        const srcY = fish.spriteRow * srcH;

        if (fishImage.complete) {
          ctx.drawImage(fishImage, srcX, srcY, srcW, srcH, -srcW/2, -srcH/2, srcW, srcH);
        }

        ctx.restore();
      });

      """
    content = content.replace(old_draw, new_draw)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced AquariumCanvas.tsx successfully.")
