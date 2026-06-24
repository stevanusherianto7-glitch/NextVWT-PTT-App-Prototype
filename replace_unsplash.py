import re

with open('C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/app/components/UserListModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
def replacer(match):
    global count
    count += 1
    # Alternate between men and women
    gender = 'men' if count % 2 == 0 else 'women'
    pic_num = (count % 70) + 1
    return f"'https://randomuser.me/api/portraits/{gender}/{pic_num}.jpg'"

new_content = re.sub(r"'https://images\.unsplash\.com/[^']+'", replacer, content)

with open('C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/app/components/UserListModal.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Replaced {count} Unsplash URLs with randomuser.me')
