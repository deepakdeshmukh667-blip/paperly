/**
 * PAPERLY — Library Integrity & Compliance Auditor
 * Enforces:
 * - Every image has non-empty photographer credit
 * - Every image has explicit licence metadata
 * - Every image file exists on disk and is non-empty
 * - Every image is >= 1200px on the long side
 * - All categories match PAPERLY standards
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_JSON = path.join(ROOT, 'data', 'images.json');

const VALID_CATEGORIES = new Set([
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
]);

function runCheck() {
  console.log('\n=============================================================');
  console.log('  PAPERLY — Library Compliance & Integrity Audit');
  console.log('=============================================================\n');

  if (!fs.existsSync(IMAGES_JSON)) {
    console.error(`❌ FAIL: Missing data file at ${IMAGES_JSON}`);
    process.exit(1);
  }

  let images = [];
  try {
    images = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
  } catch (e) {
    console.error(`❌ FAIL: Corrupted JSON in ${IMAGES_JSON}:`, e.message);
    process.exit(1);
  }

  if (!Array.isArray(images) || images.length === 0) {
    console.error(`❌ FAIL: images.json is empty or not an array.`);
    process.exit(1);
  }

  console.log(`• Auditing ${images.length} library images for licence, credit & file integrity...\n`);

  const categoryCounts = {};
  VALID_CATEGORIES.forEach(c => { categoryCounts[c] = 0; });

  const errors = [];
  const seenIds = new Set();
  const seenUrls = new Set();

  images.forEach((img, idx) => {
    const loc = `Image #${idx + 1} (id: ${img.id || 'N/A'})`;

    // 1. Unique ID & Unique URL
    if (!img.id || typeof img.id !== 'string') {
      errors.push(`${loc}: Missing or invalid 'id'`);
    } else if (seenIds.has(img.id)) {
      errors.push(`${loc}: Duplicate id '${img.id}'`);
    } else {
      seenIds.add(img.id);
    }

    if (img.downloadUrl) {
      if (seenUrls.has(img.downloadUrl)) {
        errors.push(`${loc}: Duplicate downloadUrl '${img.downloadUrl}'`);
      } else {
        seenUrls.add(img.downloadUrl);
      }
    }

    // 2. Valid Category
    if (!img.category || !VALID_CATEGORIES.has(img.category)) {
      errors.push(`${loc}: Invalid category '${img.category}'`);
    } else {
      categoryCounts[img.category]++;
    }

    // 3. Photographer Credit
    if (!img.photographer || typeof img.photographer !== 'string' || img.photographer.trim() === '') {
      errors.push(`${loc}: Missing photographer credit`);
    }

    // 4. Licence Metadata
    if (!img.license || typeof img.license !== 'string' || img.license.trim() === '') {
      errors.push(`${loc}: Missing license metadata`);
    }

    // 5. Source Information
    if (!img.source || !img.sourceUrl) {
      errors.push(`${loc}: Missing source or sourceUrl`);
    }

    // 6. Resolution (>= 1200px on long side)
    const longSide = Math.max(Number(img.width) || 0, Number(img.height) || 0);
    if (longSide < 1200) {
      errors.push(`${loc}: Resolution too low (${img.width}x${img.height}), must be >= 1200px on long side`);
    }

    // 7. Local File Validation
    if (!img.localPath) {
      errors.push(`${loc}: Missing localPath`);
    } else {
      const fullPath = path.join(ROOT, img.localPath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`${loc}: File not found on disk at '${img.localPath}'`);
      } else {
        const stats = fs.statSync(fullPath);
        if (stats.size === 0) {
          errors.push(`${loc}: File on disk is 0 bytes at '${img.localPath}'`);
        }
      }
    }
  });

  // Category Breakdown Report
  console.log('-------------------------------------------------------------');
  console.log('  CATEGORY DISTRIBUTION:');
  console.log('-------------------------------------------------------------');
  let zeroCategories = 0;
  for (const cat of VALID_CATEGORIES) {
    const count = categoryCounts[cat] || 0;
    if (count === 0) zeroCategories++;
    console.log(`  • ${cat.padEnd(20)} : ${count} items`);
  }
  console.log('-------------------------------------------------------------');

  if (errors.length > 0) {
    console.error(`\n❌ AUDIT FAILED with ${errors.length} issue(s):`);
    errors.slice(0, 20).forEach(e => console.error(`   - ${e}`));
    if (errors.length > 20) {
      console.error(`   ... and ${errors.length - 20} more errors.`);
    }
    console.log('\n=============================================================\n');
    process.exit(1);
  }

  if (zeroCategories > 0) {
    console.error(`\n❌ AUDIT FAILED: ${zeroCategories} category/categories have 0 images.`);
    process.exit(1);
  }

  console.log(`\n✅ ALL CHECKS PASSED: ${images.length} images verified.`);
  console.log('   • 100% of images have valid photographer credits.');
  console.log('   • 100% of images have valid licence specifications.');
  console.log('   • 100% of local asset files exist and have non-zero file sizes.');
  console.log('   • 100% of images meet the >= 1200px long-side resolution rule.');
  console.log('=============================================================\n');
  process.exit(0);
}

runCheck();

