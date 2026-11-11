// Syntax-check all inline <script> blocks in HTML files
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const files = ['create.html', 'studio.html', 'templates.html', 'index.html', 'dashboard.html'];
const root = path.join(__dirname, '..');
let errors = 0;

files.forEach(file => {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  const lines = content.split('\n');
  let inScript = false, start = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inScript && l.includes('<script') && !l.includes('src=') && l.trim().endsWith('>')) {
      inScript = true; start = i;
    } else if (inScript && l.includes('</script>')) {
      const code = lines.slice(start + 1, i).join('\n');
      try { new vm.Script(code); }
      catch (e) {
        console.error(`SYNTAX ERROR in ${file} (script starting at HTML line ${start + 1}): ${e.message}`);
        errors++;
      }
      inScript = false;
    }
  }
});

if (errors === 0) {
  console.log('All HTML scripts valid — no syntax errors found.');
} else {
  console.error(`${errors} syntax error(s) found.`);
  process.exit(1);
}

