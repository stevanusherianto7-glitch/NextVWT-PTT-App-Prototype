const fs = require('fs');

const filePath = 'C:/Users/ASUS/.gemini/antigravity-ide/scratch/NextVWT-PTT-App-Prototype/src/app/components/UserListModal.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

let count = 0;
content = content.replace(/'https:\/\/images\.unsplash\.com\/[^']+'/g, () => {
    count++;
    const gender = count % 2 === 0 ? 'men' : 'women';
    const picNum = (count % 70) + 1;
    return `'https://randomuser.me/api/portraits/${gender}/${picNum}.jpg'`;
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Replaced ${count} Unsplash URLs with randomuser.me`);
