// Check for abstract SVG shapes in templates-data
const fs = require('fs');
const data = fs.readFileSync('js/templates-data.js', 'utf8');
const svgCount = (data.match(/url\("data:image\/svg/gi) || []).length;
const artCount = (data.match(/PAPERLY_TEMPLATES\.art/gi) || []).length;
const purpleCircle = (data.match(/circle/gi) || []).length;
console.log('SVG data URI image bgs:', svgCount);
console.log('art() references:', artCount);
console.log('circle mentions:', purpleCircle);
// Look for first occurrence
const idx = data.indexOf('data:image/svg');
if (idx > -1) {
  console.log('\nFirst SVG at char', idx, ':', data.substring(idx - 20, idx + 100));
}

