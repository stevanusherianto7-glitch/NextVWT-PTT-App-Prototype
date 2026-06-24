import re

file_path = r'c:\Users\ASUS\Downloads\NextVWT PTT App Prototype - Clone\src\app\components\AquariumCanvas.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the fish loop block back to the original physics with fixed rendering
old_fish_loop_match = re.search(r'// AI Pathing steering force toward wandering target.*?(?=// 7\. Render Water Ripples)', content, re.DOTALL)

if old_fish_loop_match:
    new_fish_loop = """// AI Pathing steering force toward wandering target
        const distToTarget = Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y);
        if (distToTarget < 25 || Math.random() < 0.015) {
          fish.targetX = Math.random() * (width - 60) + 30;
          fish.targetY = Math.random() * (height - 40) + 20;
        }

        const targetAngle = Math.atan2(fish.targetY - fish.y, fish.targetX - fish.x);
        let angleDiff = targetAngle - fish.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        fish.angle += angleDiff * 0.045; // Smooth steering speed

        const speedMultiplier = distToTarget < 40 ? 0.6 : 1.0;
        const desiredVx = Math.cos(fish.angle) * fish.maxSpeed * speedMultiplier;
        const desiredVy = Math.sin(fish.angle) * fish.maxSpeed * speedMultiplier;

        fish.vx += (desiredVx - fish.vx) * 0.07;
        fish.vy += (desiredVy - fish.vy) * 0.07;

        // Boundary collision avoidance
        const margin = 20;
        if (fish.x < margin) {
          fish.vx += 0.16;
          fish.angle = Math.PI - fish.angle;
        }
        if (fish.x > width - margin) {
          fish.vx -= 0.16;
          fish.angle = Math.PI - fish.angle;
        }
        if (fish.y < margin) {
          fish.vy += 0.16;
          fish.angle = -fish.angle;
        }
        if (fish.y > height - margin) {
          fish.vy -= 0.16;
          fish.angle = -fish.angle;
        }

        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.angle = Math.atan2(fish.vy, fish.vx);

        const speed = Math.hypot(fish.vx, fish.vy);
        fish.wigglePhase += fish.wiggleSpeed * (speed / fish.maxSpeed + 0.3);

        // --- DRAW FISH ---
        ctx.save();
        ctx.translate(fish.x, fish.y);
        
        let isMovingLeft = fish.vx < 0;
        let scaleX = isMovingLeft !== fish.facingLeft ? -1 : 1;
        
        // Instant horizontal flip 
        ctx.scale(scaleX, 1);

        // Pitch rotation based on velocity vector
        let speedX = Math.abs(fish.vx);
        let pitch = Math.atan2(fish.vy, speedX);
        
        // Wiggle rotation
        const wiggle = Math.sin(fish.wigglePhase) * 0.1; 
        
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
          ctx.drawImage(fishImage, srcX, srcY, srcW, srcH, -srcW/2, -srcH/2, srcW, srcH);
        }

        ctx.restore();
      });

      """
    content = content.replace(old_fish_loop_match.group(0), new_fish_loop)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored original physics and fixed rendering successfully.")
