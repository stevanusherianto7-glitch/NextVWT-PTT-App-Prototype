import re

file_path = r'c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\src\app\components\AquariumCanvas.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add currentFlip to Fish interface
content = content.replace("facingLeft: boolean;\n}", "facingLeft: boolean;\n  currentFlip: number;\n}")

# 2. Add currentFlip to fishList initialization
old_fishlist_match = re.search(r'spriteRow: sprite\.row,\n\s*facingLeft: sprite\.facingLeft,\n\s*\};', content)
if old_fishlist_match:
    content = content.replace(old_fishlist_match.group(0), "spriteRow: sprite.row,\n        facingLeft: sprite.facingLeft,\n        currentFlip: 1,\n      };")

# 3. Replace the fish physics and rendering
old_fish_loop_match = re.search(r'// AI Pathing steering force toward wandering target.*?(?=// 7\. Render Water Ripples)', content, re.DOTALL)

if old_fish_loop_match:
    new_fish_loop = """// AI Pathing steering force toward wandering target
        const distToTarget = Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y);
        
        // Pick new target if reached or randomly
        if (distToTarget < 30 || Math.random() < 0.01) {
          fish.targetX = Math.random() * (width - 80) + 40;
          fish.targetY = Math.random() * (height - 60) + 30;
        }

        // Boundary collision avoidance: steer target away from walls gracefully
        const margin = 35;
        if (fish.x < margin && fish.targetX < width / 2) fish.targetX = width - margin;
        if (fish.x > width - margin && fish.targetX > width / 2) fish.targetX = margin;
        if (fish.y < margin && fish.targetY < height / 2) fish.targetY = height - margin;
        if (fish.y > height - margin && fish.targetY > height / 2) fish.targetY = margin;

        const targetAngle = Math.atan2(fish.targetY - fish.y, fish.targetX - fish.x);
        let angleDiff = targetAngle - fish.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        // Smooth steering
        fish.angle += angleDiff * 0.035; 

        const speedMultiplier = distToTarget < 50 ? 0.5 : 1.0;
        const desiredVx = Math.cos(fish.angle) * fish.maxSpeed * speedMultiplier;
        const desiredVy = Math.sin(fish.angle) * fish.maxSpeed * speedMultiplier;

        // Smooth velocity interpolation
        fish.vx += (desiredVx - fish.vx) * 0.05;
        fish.vy += (desiredVy - fish.vy) * 0.05;

        fish.x += fish.vx;
        fish.y += fish.vy;

        const speed = Math.hypot(fish.vx, fish.vy);
        fish.wigglePhase += fish.wiggleSpeed * (speed / fish.maxSpeed + 0.2);

        // --- DRAW FISH ---
        ctx.save();
        ctx.translate(fish.x, fish.y);
        
        // Use smooth interpolation for the flip to avoid popping
        let isMovingLeft = fish.vx < 0;
        let targetFlip = isMovingLeft !== fish.facingLeft ? -1 : 1;
        fish.currentFlip += (targetFlip - fish.currentFlip) * 0.15; // smooth turn

        // Horizontal flip
        ctx.scale(fish.currentFlip, 1);

        // Calculate pitch based on velocity vector
        let speedX = Math.abs(fish.vx);
        let pitch = speedX > 0.05 ? Math.atan2(fish.vy, speedX) : 0;
        
        // Add wiggle to pitch
        const wiggle = Math.sin(fish.wigglePhase) * 0.08; 
        
        ctx.rotate(pitch + wiggle);

        // Scale by fish size
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
          // Adjust drawing center so pivot is near the head (approx 1/3 from front)
          // Since fish is normalized to face right, head is on the right (+x)
          // To make it pivot around the head, we shift the image slightly to the left
          const pivotShiftX = srcW * 0.15; 
          ctx.drawImage(fishImage, srcX, srcY, srcW, srcH, -srcW/2 + pivotShiftX, -srcH/2, srcW, srcH);
        }

        ctx.restore();
      });

      """
    content = content.replace(old_fish_loop_match.group(0), new_fish_loop)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated physics and rendering successfully.")
