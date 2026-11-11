// Replace page 2 injection logic in create.html
const fs = require('fs');
let html = fs.readFileSync('create.html', 'utf8');

// Find start and end of the PAGE 2 block
const PAGE2_START = `        // --- PAGE 2 (FEATURE SPREAD / ARTICLE) ---`;
const PAGE2_END_MARKER = `        // --- PAGE 3 (DEDICATION / SPREAD / ARCHIVE) ---`;

const startIdx = html.indexOf(PAGE2_START);
const endIdx = html.indexOf(PAGE2_END_MARKER);

if (startIdx === -1) { console.error('PAGE 2 START not found'); process.exit(1); }
if (endIdx === -1) { console.error('PAGE 3 marker not found'); process.exit(1); }

console.log('PAGE 2 block: chars', startIdx, 'to', endIdx);
console.log('OLD content (first 300 chars):', html.substring(startIdx, startIdx + 300));

const newPage2Block = `        // --- PAGE 2 (FEATURE SPREAD / ARTICLE) ---
        if (templatePages.length > 1) {
          const p2 = templatePages[1];
          const p2Els = getEls(p2);
          const p2Texts = p2Els.filter(e => e.t === 'text' || e.type === 'text');
          const p2Imgs  = p2Els.filter(e => e.t === 'img'  || e.type === 'img');

          // Identify key roles by font size + position
          // Tag: smallest text at the top (size <= 12 AND y < 80)
          const p2TagEl = p2Texts.find(e => (e.size || 14) <= 12 && e.y < 80);
          // Headline: largest text element, excluding chapter numbers ("01","02" etc)
          const p2HeadEl = p2Texts
            .filter(e => e !== p2TagEl && (e.size || 14) >= 20 && (e.text || '').length > 4)
            .sort((a, b) => (b.size || 0) - (a.size || 0))[0] || null;
          // Pull-quote: italic or Cormorant Garamond
          const p2QuoteEl = p2Texts.find(e =>
            e !== p2TagEl && e !== p2HeadEl &&
            (e.italic || (e.font && e.font.includes('Garamond')))
          );
          // Body: small Inter text in right column or below photos
          const p2BodyEl = p2Texts.find(e =>
            e !== p2TagEl && e !== p2HeadEl && e !== p2QuoteEl &&
            (e.size || 14) >= 11 && (e.size || 14) <= 15 &&
            (e.x >= 260 || e.y >= 160)
          );

          // 1. Write category tag
          if (p2TagEl) {
            p2TagEl.text    = (wizardData.category || 'EDITORIAL').toUpperCase() + ' · DISPATCH';
            p2TagEl.content = p2TagEl.text;
            p2TagEl.y       = 36;
            p2TagEl.h       = 18;
          }

          // 2. Write headline — below tag, auto-scaled height
          if (p2HeadEl && headline) {
            const hText = headline;
            p2HeadEl.text    = hText;
            p2HeadEl.content = hText;
            if (hText.length > 32)      p2HeadEl.size = 20;
            else if (hText.length > 20) p2HeadEl.size = 24;
            else                         p2HeadEl.size = 28;
            const tagBottom = p2TagEl ? p2TagEl.y + (p2TagEl.h || 18) : 36;
            p2HeadEl.y = tagBottom + 10;
            const cpl   = Math.max(10, Math.floor((p2HeadEl.w || 468) / (p2HeadEl.size * 0.58)));
            const hLines = Math.max(1, Math.ceil(hText.length / cpl));
            p2HeadEl.h = Math.max(40, Math.round(hLines * p2HeadEl.size * 1.3));
          }

          // 3. Push every OTHER text element below headline bottom
          const p2HeadlineBottom = p2HeadEl ? p2HeadEl.y + (p2HeadEl.h || 50) : 120;
          p2Texts.forEach(e => {
            if (e !== p2TagEl && e !== p2HeadEl && e.y < p2HeadlineBottom + 10) {
              e.y = p2HeadlineBottom + 16;
            }
          });

          // Line accent just below headline
          const p2LineEl = p2Els.find(e => e.t === 'line' || e.type === 'line');
          if (p2LineEl && p2HeadEl) {
            p2LineEl.y = p2HeadEl.y + (p2HeadEl.h || 50) + 8;
          }

          // 4. Write body story
          if (p2BodyEl && story) {
            p2BodyEl.text    = story;
            p2BodyEl.content = story;
            if (p2BodyEl.x < 260) {
              p2BodyEl.x = 315;
              p2BodyEl.w = 190;
            }
            if (p2BodyEl.y < p2HeadlineBottom + 20) p2BodyEl.y = p2HeadlineBottom + 20;
          }

          // 5. Assign uploaded photos to image slots (round-robin, [0] used by cover)
          p2Imgs.forEach((img, idx) => {
            const photoSrc = wizardData.photos[idx + 1];
            if (photoSrc) {
              img.src  = photoSrc;
              img.bg   = 'url("' + photoSrc + '")';
              img.type = 'upload';
              const pm = wizardData.photoModels && wizardData.photoModels[idx + 1];
              if (pm) img.imageId = pm.id;
            }
            img.fit      = img.fit || 'cover';
            img.position = img.position || 'center';
          });

          // 6. Write pull-quote
          if (p2QuoteEl && dedication) {
            const qText = dedication.replace(/^["\u2018\u201c]+|["\u2019\u201d]+$/g, '');
            p2QuoteEl.text    = '\u201c' + qText + '\u201d';
            p2QuoteEl.content = p2QuoteEl.text;
            if (p2QuoteEl.y < p2HeadlineBottom + 20) p2QuoteEl.y = p2HeadlineBottom + 20;
          }
        }

`;

html = html.substring(0, startIdx) + newPage2Block + html.substring(endIdx);
fs.writeFileSync('create.html', html, 'utf8');
console.log('Done. PAGE 2 block replaced successfully.');

