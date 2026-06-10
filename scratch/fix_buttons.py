import os
import re

count = 0
for r, _, fs in os.walk('src'):
    for f in fs:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(r, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find and replace
            new_content, n = re.subn(r'<button\b(?![^>]*\btype=)', '<button type="button"', content)
            if n > 0:
                count += n
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)

print(f"Added type='button' to {count} buttons.")
