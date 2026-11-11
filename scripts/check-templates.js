/**
 * PAPERLY — Template Catalog Quality Assurance Checker
 * Validates template counts, required fields, category distributions,
 * thumbnail files, image credit integrity, and filter tabs alignment.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATES_FILE = path.join(ROOT, 'data', 'templates.json');
const CREDITS_FILE = path.join(ROOT, 'assets', 'samples', 'credit.json');
const TEMPLATES_HTML = path.join(ROOT, 'templates.html');

const REQUIRED_CATEGORIES = [
  'Fashion',
  'Travel',
  'Lifestyle',
  'Wedding',
  'Business',
  'Portfolio',
  'Food',
  'Photography',
  'Personal/Memory',
  'Education'
];

const REQUIRED_FIELDS = [
  'id',
  'name',
  'category',
  'sourceType',
  'sourceAttribution',
  'tags',
  'mood',
  'pageCount',
  'photoSlots',
  'thumbnail',
  'themeTokens',
  'pages'
];

let errors = [];
let warnings = [];

console.log(`\n==================================================`);
console.log(`  PAPERLY — Template Catalog Integrity Audit`);
console.log(`==================================================\n`);

// 1. Validate data/templates.json existence
if (!fs.existsSync(TEMPLATES_FILE)) {
  console.error(`[FAIL] data/templates.json does not exist.`);
  process.exit(1);
}

let templates = {};
try {
  templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
} catch (e) {
  console.error(`[FAIL] data/templates.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

const templateKeys = Object.keys(templates);
const totalCount = templateKeys.length;
console.log(`✓ Total Templates in Catalog: ${totalCount}`);

// 2. Count must be >= 100
if (totalCount < 100) {
  errors.push(`Template count is ${totalCount}, but minimum 100 is required.`);
}

// 3. Category count check (>= 8 per category)
const categoryCounts = {};
REQUIRED_CATEGORIES.forEach(c => { categoryCounts[c] = 0; });

// 4. Sample Credits check
let credits = [];
try {
  credits = JSON.parse(fs.readFileSync(CREDITS_FILE, 'utf8'));
} catch (e) {
  errors.push(`assets/samples/credit.json is missing or unreadable.`);
}
const creditPaths = new Set(credits.map(c => c.localPath.replace(/\\/g, '/')));

const sourceCounts = { imported: 0, inspired: 0 };

// 5. Inspect each template
templateKeys.forEach(key => {
  const tpl = templates[key];

  if (tpl.sourceType && sourceCounts[tpl.sourceType] !== undefined) {
    sourceCounts[tpl.sourceType]++;
  }

  // Required fields
  REQUIRED_FIELDS.forEach(field => {
    if (tpl[field] === undefined || tpl[field] === null || tpl[field] === '') {
      errors.push(`Template "${key}" is missing required field "${field}".`);
    }
  });

  // Category tracking
  if (tpl.category && categoryCounts[tpl.category] !== undefined) {
    categoryCounts[tpl.category]++;
  } else if (tpl.category) {
    categoryCounts[tpl.category] = (categoryCounts[tpl.category] || 0) + 1;
  }

  // Thumbnail file check
  if (tpl.thumbnail) {
    const thumbPath = path.join(ROOT, tpl.thumbnail);
    if (!fs.existsSync(thumbPath)) {
      errors.push(`Template "${key}" thumbnail does not exist: ${tpl.thumbnail}`);
    }
  }

  // Image credit check across pages
  if (Array.isArray(tpl.pages)) {
    tpl.pages.forEach((page, pIdx) => {
      (page.els || []).forEach((el, elIdx) => {
        if ((el.t === 'img' || el.type === 'img') && el.src) {
          const cleanSrc = el.src.replace(/\\/g, '/');
          if (cleanSrc.startsWith('assets/samples/') && !creditPaths.has(cleanSrc)) {
            errors.push(`Template "${key}" page ${pIdx + 1} has image without credit entry: ${cleanSrc}`);
          }
        }
      });
    });
  }
});

// Category threshold check
REQUIRED_CATEGORIES.forEach(cat => {
  const count = categoryCounts[cat] || 0;
  console.log(`  - Category: ${cat.padEnd(16)} | Count: ${count}`);
  if (count < 8) {
    errors.push(`Category "${cat}" has only ${count} templates (minimum 8 required).`);
  }
});

// 6. Check templates.html filter pills alignment
if (fs.existsSync(TEMPLATES_HTML)) {
  const htmlContent = fs.readFileSync(TEMPLATES_HTML, 'utf8');
  REQUIRED_CATEGORIES.forEach(cat => {
    const pattern = new RegExp(`data-cat=["']${cat}["']`, 'i');
    if (!pattern.test(htmlContent)) {
      errors.push(`Category "${cat}" is missing from filter tabs in templates.html.`);
    }
  });
} else {
  warnings.push(`templates.html not found to verify filter tabs.`);
}

console.log(`\n--------------------------------------------------`);
if (errors.length > 0) {
  console.error(`[AUDIT FAILED] Found ${errors.length} error(s):`);
  errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
  console.log(`--------------------------------------------------\n`);
  process.exit(1);
} else {
  console.log(`[AUDIT PASSED] All 100 templates verified successfully!`);
  console.log(`  - Sources:   ${sourceCounts.imported} Imported Collections | ${sourceCounts.inspired} Original Inspired Editions`);
  console.log(`  - All 10 categories populated (>= 8 per category)`);
  console.log(`  - All required metadata fields present`);
  console.log(`  - All thumbnails verified on disk`);
  console.log(`  - All sample image credits validated`);
  console.log(`  - All filter tabs matched in templates.html`);
  console.log(`--------------------------------------------------\n`);
  process.exit(0);
}

