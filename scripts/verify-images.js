// Verify all sample PNG files are valid images (not stub/corrupt)
const fs = require('fs');
const path = require('path');

const samplesDir = path.join(__dirname, '..', 'assets', 'samples');
const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.png'));

files.forEach(f => {
  const fp = path.join(samplesDir, f);
  const buf = fs.readFileSync(fp);
  
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const isPNG = buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
    buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A;
  
  // Check IHDR chunk which tells us width/height
  let w = 0, h = 0;
  if (isPNG && buf.length >= 24) {
    w = buf.readUInt32BE(16);
    h = buf.readUInt32BE(20);
  }
  
  const status = isPNG ? (w > 1 && h > 1 ? 'OK ' : 'TINY') : 'BAD';
  console.log(status, f, '(' + buf.length + ' bytes,' + w + 'x' + h + ')');
});

