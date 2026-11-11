// Bisects to find the exact line a syntax error appears in a script block
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function findErrorLine(file, scriptStartHtmlLine) {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const lines = content.split('\n');
  let inScript = false, start = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inScript && l.includes('<script') && !l.includes('src=') && l.trim().endsWith('>')) {
      inScript = true; start = i;
    } else if (inScript && l.includes('</script>')) {
      if (start + 1 === scriptStartHtmlLine - 1) {
        const codeLines = lines.slice(start + 1, i);
        // Bisect to find the first line that breaks it
        for (let n = 1; n <= codeLines.length; n++) {
          try { new vm.Script(codeLines.slice(0, n).join('\n')); }
          catch (e) {
            if (!e.message.includes('Unexpected end')) {
              const htmlLine = start + 1 + n;
              console.log(`File: ${file}`);
              console.log(`Error at HTML line ${htmlLine}: ${e.message}`);
              console.log(`Content: [${codeLines[n - 1]}]`);
              console.log(`Context:\n${codeLines.slice(Math.max(0,n-4), n+2).map((l,j) => `  ${start+1+n-4+j+1}: ${l}`).join('\n')}`);
              return;
            }
          }
        }
      }
      inScript = false;
    }
  }
}

findErrorLine('create.html', 968);
findErrorLine('studio.html', 725);

