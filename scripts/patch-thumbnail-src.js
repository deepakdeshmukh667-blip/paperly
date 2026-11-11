// Patch create.html to use cover sample photo instead of generated thumbnail
const fs = require('fs');
let html = fs.readFileSync('create.html', 'utf8');

// Find the template card generation code
const OLD = `        const coverBg = ed.coverBg || (ed.pages && ed.pages[0]?.bg) || '#1c1712';
        const coverImg = ed.thumbnail || ed.cover || \`assets/thumbnails/\${key}.png\`;`;

const NEW = `        // Use the best available preview: sample cover photo → thumbnail → page bg color
        const coverBg = ed.coverBg || (ed.pages && ed.pages[0] && ed.pages[0].bg) || '#1c1712';
        // Prefer the first real sample photo from page 1, fall back to thumbnail/cover
        const p1Imgs = (ed.pages && ed.pages[0] && ed.pages[0].els || []).filter(e => e.t === 'img' && e.src && !e.src.includes('thumbnails'));
        const coverImg = (p1Imgs.length > 0 ? p1Imgs[0].src : null)
          || ed.cover
          || ed.thumbnail
          || ('assets/thumbnails/' + key + '.png');`;

if (!html.includes(OLD.trim())) {
  // Try alternative whitespace
  const OLD2 = `        const coverBg = ed.coverBg || (ed.pages && ed.pages[0]?.bg) || '#1c1712';`;
  const idx2 = html.indexOf(OLD2);
  if (idx2 > -1) {
    console.log('Found simplified old code at char', idx2);
    // Replace just the coverImg line too
    const lineEnd = html.indexOf('\n', idx2 + OLD2.length);
    const nextLineEnd = html.indexOf('\n', lineEnd + 1);
    const twoLines = html.substring(idx2, nextLineEnd);
    console.log('Two lines found:', JSON.stringify(twoLines));
  }
  console.error('OLD string not found exactly. Checking fallback...');
}

const idx = html.indexOf('const coverBg = ed.coverBg');
if (idx > -1) {
  const lineEnd = html.indexOf('\n', idx);
  const nextLineEnd = html.indexOf('\n', lineEnd + 1);
  const twoLines = html.substring(idx, nextLineEnd).trim();
  console.log('Found block at char', idx, ':', JSON.stringify(twoLines.substring(0, 150)));
  
  // Find start of indented block (go back to find spaces)
  let blockStart = idx;
  while (blockStart > 0 && html[blockStart-1] !== '\n') blockStart--;
  
  const nextBlock = html.substring(blockStart, nextLineEnd + 1);
  console.log('Block to replace:', JSON.stringify(nextBlock));
  
  if (html.includes(nextBlock)) {
    html = html.replace(nextBlock,
      `        // Use best available preview: sample cover photo → thumbnail → page bg\n` +
      `        const coverBg = ed.coverBg || (ed.pages && ed.pages[0] && ed.pages[0].bg) || '#1c1712';\n` +
      `        const p1Imgs = (ed.pages && ed.pages[0] && ed.pages[0].els || []).filter(e => e.t === 'img' && e.src && !e.src.includes('thumbnails'));\n` +
      `        const coverImg = (p1Imgs.length > 0 ? p1Imgs[0].src : null) || ed.cover || ed.thumbnail || ('assets/thumbnails/' + key + '.png');\n`
    );
    fs.writeFileSync('create.html', html, 'utf8');
    console.log('Patched successfully!');
  } else {
    console.error('Could not find exact block to replace.');
  }
} else {
  console.error('coverBg line not found at all!');
}

