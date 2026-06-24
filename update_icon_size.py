import re

file_path = 'src/app/components/UserListModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the current size with 50%
updated = content.replace(
    'className=\"w-[65%] h-[65%] object-contain\"',
    'className=\"w-[50%] h-[50%] object-contain\"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated)

print('Icon size updated to 50%')
