const fs = require('fs');
const data = fs.readFileSync('js/templates-data.js', 'utf8');

// Find img elements with bg that is NOT a url()
const imgBgMatches = data.match(/t:\s*['"]img['"]\s*,[^}]{0,500}/g) || [];
let nonUrlCount = 0;
imgBgMatches.forEach((m, i) => {
  const hasBg = m.includes('bg');
  const hasUrl = m.includes('url(');
  if (hasBg && !hasUrl) {
    nonUrlCount++;
    console.log('Non-URL bg at match ' + i + ':', m.substring(0, 200));
  }
});
console.log('\nTotal img elements:', imgBgMatches.length);
console.log('With non-URL bg:', nonUrlCount);

// Also check for any "art(" calls or unusual bg values
const artRefs = (data.match(/art\s*\(/g) || []).length;
console.log('art() calls:', artRefs);

// Look for img elements with no src and no bg
const noSrcNoBg = imgBgMatches.filter(m => !m.includes('src') && !m.includes('bg'));
console.log('Img elements with no src AND no bg:', noSrcNoBg.length);
if (noSrcNoBg.length > 0) console.log('First:', noSrcNoBg[0]);

