const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/templates-data.js', 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);

const EDITIONS = ctx.window.PAPERLY_TEMPLATES.EDITIONS;

// Check best-friend = personal-memory-1-forever-sisters
const ed = EDITIONS['best-friend'];
if (!ed) {
  console.log('No best-friend template found!');
  process.exit(1);
}

console.log('=== best-friend template ===');
console.log('Name:', ed.name);
console.log('Pages:', ed.pages.length);

ed.pages.forEach((pg, pi) => {
  console.log('\nPage ' + (pi+1) + ' bg:', pg.bg);
  console.log('Elements:');
  (pg.els || []).forEach((el, ei) => {
    if (el.t === 'img') {
      console.log('  [IMG el ' + ei + '] src:', el.src ? el.src.substring(0, 80) : '(none)');
      console.log('           bg:', el.bg ? el.bg.substring(0, 80) : '(none)');
    } else if (el.t === 'text') {
      console.log('  [TXT el ' + ei + '] y:' + el.y + ' size:' + el.size + ' text:', (el.text || '').substring(0, 60));
    } else {
      console.log('  [' + el.t + ' el ' + ei + ']');
    }
  });
});

