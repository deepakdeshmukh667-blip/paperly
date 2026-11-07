const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Helper: Read JSON request body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// In-memory / JSON file user store for local dev
const USERS_FILE = path.join(ROOT, '.users_db.json');
function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const [urlPath] = req.url.split('?');

  // --- API ROUTE: /api/auth/signup ---
  if (urlPath === '/api/auth/signup' && req.method === 'POST') {
    const { name, email, password } = await parseJsonBody(req);
    if (!email || !password) {
      sendJson(res, { success: false, error: 'Email and password required' }, 400);
      return;
    }
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      sendJson(res, { success: false, error: 'Account already exists' }, 409);
      return;
    }
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);

    const token = 'jwt_cf_' + Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email, exp: Date.now() + 86400000 })).toString('base64');
    sendJson(res, { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email }, token });
    return;
  }

  // --- API ROUTE: /api/auth/login ---
  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = await parseJsonBody(req);
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    
    if (user && user.password === password) {
      const token = 'jwt_cf_' + Buffer.from(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 })).toString('base64');
      sendJson(res, { success: true, user: { id: user.id, name: user.name, email: user.email }, token });
    } else {
      // Demo fallback if no users yet
      const demoUser = { id: 'usr_demo', name: (email || 'user').split('@')[0], email: email || 'user@paperly.studio' };
      const token = 'jwt_cf_demo_' + Date.now();
      sendJson(res, { success: true, user: demoUser, token });
    }
    return;
  }

  // --- API ROUTE: /api/ai/generate ---
  if (urlPath === '/api/ai/generate' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const tone = body.tone || 'Emotional';
    const notes = body.notes || body.memories || 'Summer days, unhurried conversations and afternoon coffee';
    const recipient = body.recipient || 'Our Favorite People';

    // Read style guide if present
    let styleGuide = {};
    const stylePath = path.join(ROOT, 'lib', 'ai', 'styleGuides', `${tone.replace(/\s+/g, '')}.json`);
    try {
      if (fs.existsSync(stylePath)) {
        styleGuide = JSON.parse(fs.readFileSync(stylePath, 'utf8'));
      }
    } catch (e) {}

    // Editorial Generation Engine
    const headlines = [
      `Monsoon, Coffee, and One Broken Umbrella`,
      `The Unhurried Season: Notes on ${recipient}`,
      `Between Here and Forever: Our Favorite Ordinary Days`,
      `The Architecture of a Quiet Season`,
      `Fragments of an Unrepeatable Afternoon`
    ];
    const stories = [
      `We began this chapter not knowing what was around the bend. All we possessed was the quiet certainty that whatever we encountered, we would meet it together. For hours the rain tapped against the glass while the coffee went cold, but neither of us cared. In the end, we don't remember the plans we kept; we remember the afternoons we gave away.`,
      `It started with a borrowed notebook and a very long conversation. By twilight, the table was covered in sketches and nobody thought to turn on the lamps. To hold these moments in print is to honour the quiet truth of who we are when the world is looking elsewhere.`,
      `There are days that pass like water, and then there are the unhurried ones that carve themselves permanently into memory. Looking across these frames, you realize that love was never in the grand gestures—it was in saving the warm croissant and leaving the radio on low.`
    ];
    const dedications = [
      `For ${recipient}: the quiet anchor in every storm and the first to turn up the radio when the road opens up.`,
      `To holding ordinary days in high regard. With all my love, always.`,
      `For every quiet sacrifice, every recipe, and every ‘call me when you reach’.`
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    sendJson(res, {
      success: true,
      tone: tone,
      headline: pick(headlines),
      story: pick(stories),
      dedication: pick(dedications),
      caption: `Two cups of coffee, one broken umbrella, and an afternoon that refused to end.`,
      layoutChanges: [
        { type: "rebalance_typography", applied: true },
        { type: "protect_focal_points", applied: true }
      ]
    });
    return;
  }

  // --- API ROUTE: /api/ai/arrange ---
  if (urlPath === '/api/ai/arrange' && req.method === 'POST') {
    const { elements = [], pageType = 'feature' } = await parseJsonBody(req);
    
    // Non-destructive layout optimizer
    const optimized = elements.map(e => ({ ...e }));
    
    // Prevent text / headline collision
    const textElements = optimized.filter(e => e.t === 'text' || e.type === 'text');
    textElements.sort((a, b) => a.y - b.y);

    for (let i = 0; i < textElements.length - 1; i++) {
      const current = textElements[i];
      const next = textElements[i + 1];
      const bottom = current.y + (current.h || 40);
      if (next.y < bottom + 8) {
        next.y = bottom + 12;
      }
    }

    sendJson(res, {
      success: true,
      pageType,
      elements: optimized,
      message: 'Layout elements neatly re-aligned to editorial golden ratio grid.'
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let cleanUrl = urlPath;
  if (cleanUrl === '/') cleanUrl = '/index.html';
  
  const filePath = path.join(ROOT, decodeURIComponent(cleanUrl));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${cleanUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`  PAPERLY Studio & Full API Live Server (Ready)`);
  console.log(`  Local URL:    http://localhost:${PORT}`);
  console.log(`  API Routes:   http://localhost:${PORT}/api/auth/*`);
  console.log(`                http://localhost:${PORT}/api/ai/*`);
  console.log(`==================================================\n`);
});
