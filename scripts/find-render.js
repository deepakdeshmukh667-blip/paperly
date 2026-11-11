const fs = require('fs');
const studio = fs.readFileSync('studio.html', 'utf8');

// Find the render/draw function - look for where elements get painted to the page
const terms = [
  "function renderPage",
  "function drawPage",
  "function render(",
  "function draw(",
  "function paintPage",
  "innerHTML",
  "background-image",
  "background:",
  "object-fit",
];

terms.forEach(t => {
  let idx = 0;
  let found = 0;
  while ((idx = studio.indexOf(t, idx)) > -1 && found < 2) {
    console.log(`\n"${t}" at char ${idx}:`);
    console.log(studio.substring(Math.max(0, idx - 20), idx + 300));
    console.log('---');
    idx++;
    found++;
  }
});
