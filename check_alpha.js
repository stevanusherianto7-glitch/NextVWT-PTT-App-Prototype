const fs = require('fs');
const buffer = fs.readFileSync('src/imports/logo_nextvwt.png');

const colorType = buffer[25];
console.log('Color type:', colorType);
// 2 = Truecolor, 6 = Truecolor with alpha
if (colorType === 2) {
  console.log('NO ALPHA CHANNEL. IT IS OPAQUE!');
} else if (colorType === 6) {
  console.log('HAS ALPHA CHANNEL.');
}
