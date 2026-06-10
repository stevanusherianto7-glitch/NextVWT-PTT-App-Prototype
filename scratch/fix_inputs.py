import re
with open('src/app/components/SettingsPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def smart_replace(match):
    start = match.start()
    tag_content = content[start:start+400]
    end_idx = tag_content.find('/>')
    if end_idx == -1: end_idx = tag_content.find('>')
    if 'title=' in tag_content[:end_idx]:
        return match.group(0)
    return '<input title="Settings Input" aria-label="Settings Input"'

new_content = re.sub(r'<input\b', smart_replace, content)

with open('src/app/components/SettingsPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Fixed inputs!')
