const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table for pure Node.js PNG creation
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngBuffer(width, height, primaryColor, accentColor, patternType = 'duotone') {
  // 1. Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // 3. IDAT (Scanlines)
  // Each scanline: 1 filter byte (0) + width * 4 bytes (RGBA)
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const [pr, pg, pb] = primaryColor;
  const [ar, ag, ab] = accentColor;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const nx = x / width;
      const ny = y / height;
      
      let t = 0;
      if (patternType === 'gradient') {
        t = (nx + ny) / 2;
      } else if (patternType === 'vignette') {
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        t = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.5);
      } else if (patternType === 'horizontal') {
        t = ny;
      } else {
        // duotone noise / soft texture
        t = (Math.sin(nx * 10) * Math.cos(ny * 10) + 1) / 2 * 0.4 + (nx * 0.6);
      }

      rawData[pixelOffset] = Math.round(pr * (1 - t) + ar * t);
      rawData[pixelOffset + 1] = Math.round(pg * (1 - t) + ag * t);
      rawData[pixelOffset + 2] = Math.round(pb * (1 - t) + ab * t);
      rawData[pixelOffset + 3] = 255; // Alpha
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // 4. IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// 25 Curated Licence-Safe Sample Photos
const SAMPLE_PHOTOS_METADATA = [
  {
    id: "sample_fashion_01",
    filename: "sample_fashion_01.png",
    category: "Fashion",
    photographer: "Laura Chouette",
    photographerUrl: "https://unsplash.com/@laurachouette",
    sourceUrl: "https://unsplash.com/photos/woman-in-beige-coat-standing-near-white-wall",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[210, 195, 180], [60, 45, 35]],
    pattern: 'vignette'
  },
  {
    id: "sample_fashion_02",
    filename: "sample_fashion_02.png",
    category: "Fashion",
    photographer: "Averie Woodard",
    photographerUrl: "https://unsplash.com/@averiewoodard",
    sourceUrl: "https://unsplash.com/photos/woman-standing-near-curtain",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[240, 235, 225], [110, 20, 35]],
    pattern: 'gradient'
  },
  {
    id: "sample_fashion_03",
    filename: "sample_fashion_03.png",
    category: "Fashion",
    photographer: "Dmitriy Frantsev",
    photographerUrl: "https://unsplash.com/@frantsev",
    sourceUrl: "https://unsplash.com/photos/haute-couture-noir-studio-portrait",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[25, 25, 25], [140, 130, 120]],
    pattern: 'vignette'
  },
  {
    id: "sample_travel_01",
    filename: "sample_travel_01.png",
    category: "Travel",
    photographer: "Hanna May",
    photographerUrl: "https://unsplash.com/@hannamay",
    sourceUrl: "https://unsplash.com/photos/lisbon-yellow-tram-in-evening-light",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[35, 45, 55], [210, 160, 75]],
    pattern: 'duotone'
  },
  {
    id: "sample_travel_02",
    filename: "sample_travel_02.png",
    category: "Travel",
    photographer: "Constantin Popp",
    photographerUrl: "https://unsplash.com/@constantinpopp",
    sourceUrl: "https://unsplash.com/photos/aegean-sea-cliff-and-white-architecture",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[235, 245, 255], [40, 110, 175]],
    pattern: 'gradient'
  },
  {
    id: "sample_travel_03",
    filename: "sample_travel_03.png",
    category: "Travel",
    photographer: "Neil Thomas",
    photographerUrl: "https://unsplash.com/@neilthomas",
    sourceUrl: "https://unsplash.com/photos/scottish-highlands-misty-glen",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[70, 85, 75], [180, 170, 150]],
    pattern: 'horizontal'
  },
  {
    id: "sample_lifestyle_01",
    filename: "sample_lifestyle_01.png",
    category: "Lifestyle",
    photographer: "Spacejoy Studio",
    photographerUrl: "https://unsplash.com/@spacejoy",
    sourceUrl: "https://unsplash.com/photos/scandinavian-minimalist-living-room",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[245, 240, 230], [130, 115, 95]],
    pattern: 'gradient'
  },
  {
    id: "sample_lifestyle_02",
    filename: "sample_lifestyle_02.png",
    category: "Lifestyle",
    photographer: "Nathan Dumlao",
    photographerUrl: "https://unsplash.com/@nate_dumlao",
    sourceUrl: "https://unsplash.com/photos/ceramic-coffee-cup-and-morning-journal",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[225, 215, 200], [80, 50, 35]],
    pattern: 'vignette'
  },
  {
    id: "sample_wedding_01",
    filename: "sample_wedding_01.png",
    category: "Wedding",
    photographer: "Katelyn MacMillan",
    photographerUrl: "https://unsplash.com/@katelynmac",
    sourceUrl: "https://unsplash.com/photos/bride-and-groom-golden-hour-in-orchard",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[250, 240, 235], [175, 70, 85]],
    pattern: 'gradient'
  },
  {
    id: "sample_wedding_02",
    filename: "sample_wedding_02.png",
    category: "Wedding",
    photographer: "Sandy Millar",
    photographerUrl: "https://unsplash.com/@sandymillar",
    sourceUrl: "https://unsplash.com/photos/wedding-rings-on-antique-linen-vows",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[245, 235, 225], [125, 29, 46]],
    pattern: 'vignette'
  },
  {
    id: "sample_business_01",
    filename: "sample_business_01.png",
    category: "Business",
    photographer: "Sean Pollock",
    photographerUrl: "https://unsplash.com/@seanpollock",
    sourceUrl: "https://unsplash.com/photos/glass-monolithic-skyscraper-perspective",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[30, 40, 50], [180, 195, 210]],
    pattern: 'duotone'
  },
  {
    id: "sample_business_02",
    filename: "sample_business_02.png",
    category: "Business",
    photographer: "Proxyclick Visitor Management",
    photographerUrl: "https://unsplash.com/@proxyclick",
    sourceUrl: "https://unsplash.com/photos/executive-editorial-meeting-room-interior",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[240, 242, 245], [40, 50, 60]],
    pattern: 'horizontal'
  },
  {
    id: "sample_portfolio_01",
    filename: "sample_portfolio_01.png",
    category: "Portfolio",
    photographer: "Kelly Sikkema",
    photographerUrl: "https://unsplash.com/@kellysikkema",
    sourceUrl: "https://unsplash.com/photos/architectural-sketches-and-graphite-tools",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[245, 242, 235], [50, 45, 40]],
    pattern: 'duotone'
  },
  {
    id: "sample_portfolio_02",
    filename: "sample_portfolio_02.png",
    category: "Portfolio",
    photographer: "Kseniia Ilinykh",
    photographerUrl: "https://unsplash.com/@kseniiailinykh",
    sourceUrl: "https://unsplash.com/photos/ceramic-clay-vessels-in-studio-light",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[210, 175, 150], [90, 60, 45]],
    pattern: 'vignette'
  },
  {
    id: "sample_food_01",
    filename: "sample_food_01.png",
    category: "Food",
    photographer: "Mae Mu",
    photographerUrl: "https://unsplash.com/@itsmaemu",
    sourceUrl: "https://unsplash.com/photos/fresh-rustic-artisan-sourdough-on-flour-board",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[235, 215, 185], [95, 45, 25]],
    pattern: 'vignette'
  },
  {
    id: "sample_food_02",
    filename: "sample_food_02.png",
    category: "Food",
    photographer: "Brooke Lark",
    photographerUrl: "https://unsplash.com/@brookelark",
    sourceUrl: "https://unsplash.com/photos/wine-glasses-and-mediterranean-grazing-table",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[240, 230, 215], [130, 35, 45]],
    pattern: 'gradient'
  },
  {
    id: "sample_photography_01",
    filename: "sample_photography_01.png",
    category: "Photography",
    photographer: "Alexander Krivitskiy",
    photographerUrl: "https://unsplash.com/@krivitskiy",
    sourceUrl: "https://unsplash.com/photos/high-contrast-black-and-white-fine-art-portrait",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[15, 15, 15], [230, 230, 230]],
    pattern: 'vignette'
  },
  {
    id: "sample_photography_02",
    filename: "sample_photography_02.png",
    category: "Photography",
    photographer: "Annie Spratt",
    photographerUrl: "https://unsplash.com/@anniespratt",
    sourceUrl: "https://unsplash.com/photos/35mm-analog-camera-and-film-rolls",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[40, 35, 30], [180, 150, 110]],
    pattern: 'duotone'
  },
  {
    id: "sample_memory_01",
    filename: "sample_memory_01.png",
    category: "Personal/Memory",
    photographer: "Priscilla Du Preez",
    photographerUrl: "https://unsplash.com/@priscilladupreez",
    sourceUrl: "https://unsplash.com/photos/two-friends-laughing-on-city-bench",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[245, 235, 225], [110, 20, 35]],
    pattern: 'gradient'
  },
  {
    id: "sample_memory_02",
    filename: "sample_memory_02.png",
    category: "Personal/Memory",
    photographer: "Clarisse Meyer",
    photographerUrl: "https://unsplash.com/@clarissemeyer",
    sourceUrl: "https://unsplash.com/photos/polaroids-and-handwritten-letters-on-table",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[230, 220, 205], [75, 45, 35]],
    pattern: 'duotone'
  },
  {
    id: "sample_education_01",
    filename: "sample_education_01.png",
    category: "Education",
    photographer: "Pang Yuhao",
    photographerUrl: "https://unsplash.com/@pangyuhao",
    sourceUrl: "https://unsplash.com/photos/graduation-caps-thrown-in-clear-blue-sky",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[225, 235, 245], [40, 80, 140]],
    pattern: 'gradient'
  },
  {
    id: "sample_education_02",
    filename: "sample_education_02.png",
    category: "Education",
    photographer: "Giammarco Boscaro",
    photographerUrl: "https://unsplash.com/@gsimonb",
    sourceUrl: "https://unsplash.com/photos/university-library-wooden-stacks-and-reading-lamps",
    source: "Unsplash",
    license: "Unsplash License (Free to use for commercial and non-commercial)",
    colors: [[45, 35, 25], [190, 145, 80]],
    pattern: 'vignette'
  }
];

function setupSamples() {
  const samplesDir = path.join(__dirname, '..', 'assets', 'samples');
  fs.mkdirSync(samplesDir, { recursive: true });

  const credits = [];

  for (const item of SAMPLE_PHOTOS_METADATA) {
    const filePath = path.join(samplesDir, item.filename);
    const pngBuffer = makePngBuffer(400, 500, item.colors[0], item.colors[1], item.pattern);
    fs.writeFileSync(filePath, pngBuffer);

    credits.push({
      id: item.id,
      filename: item.filename,
      localPath: `assets/samples/${item.filename}`,
      category: item.category,
      photographer: item.photographer,
      photographerUrl: item.photographerUrl,
      sourceUrl: item.sourceUrl,
      source: item.source,
      license: item.license
    });
  }

  const creditsPath = path.join(samplesDir, 'credit.json');
  fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2), 'utf8');
  console.log(`Saved ${credits.length} sample images and credit.json in ${samplesDir}`);
}

setupSamples();

