const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BRAIN_DIR = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\3ecf09b9-92c7-4c6d-bc49-d42bc9868714';
const OUTPUT_DIR = path.resolve('public/approach');

async function processEnvironment() {
  const src = path.join(BRAIN_DIR, 'approach_environment_1792424363160.jpg');
  const dest = path.join(OUTPUT_DIR, 'approach-environment.webp');
  
  await sharp(src)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 90 })
    .toFile(dest);
  
  console.log('Saved:', dest);
}

// Flood fill from outer borders to identify true background and create smooth alpha
async function makeCutout(srcName, destName, options = {}) {
  const src = path.join(BRAIN_DIR, srcName);
  const dest = path.join(OUTPUT_DIR, destName);
  
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const isBg = new Uint8Array(width * height);
  const queue = [];

  // Threshold for background black detection
  const bgThreshold = options.bgThreshold || 24;

  const getIdx = (x, y) => (y * width + x);
  const getPixel = (x, y) => {
    const p = (y * width + x) * channels;
    return [data[p], data[p + 1], data[p + 2], data[p + 3]];
  };

  // Optional: clear out specific regions (e.g. background text in top left corner of design_cutout)
  if (options.clearRegion) {
    const { minX, maxX, minY, maxY } = options.clearRegion;
    for (let y = Math.floor(minY * height); y < Math.floor(maxY * height); y++) {
      for (let x = Math.floor(minX * width); x < Math.floor(maxX * width); x++) {
        const p = (y * width + x) * channels;
        data[p] = 0;
        data[p + 1] = 0;
        data[p + 2] = 0;
        data[p + 3] = 0;
        isBg[getIdx(x, y)] = 1;
      }
    }
  }

  // Seed boundary points
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = getIdx(x, y);

    if (isBg[idx]) continue;

    const [r, g, b] = getPixel(x, y);
    const maxVal = Math.max(r, g, b);

    if (maxVal <= bgThreshold) {
      isBg[idx] = 1;

      // Check 4 neighbours
      if (x > 0 && !isBg[getIdx(x - 1, y)]) queue.push(x - 1, y);
      if (x < width - 1 && !isBg[getIdx(x + 1, y)]) queue.push(x + 1, y);
      if (y > 0 && !isBg[getIdx(x, y - 1)]) queue.push(x, y - 1);
      if (y < height - 1 && !isBg[getIdx(x, y + 1)]) queue.push(x, y + 1);
    }
  }

  // Now apply alpha and smooth feathering around edges
  const feather = options.feather || 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIdx(x, y);
      const p = idx * channels;

      if (isBg[idx]) {
        data[p + 3] = 0;
      } else {
        // Calculate distance to nearest background pixel for smooth anti-aliased edge
        const [r, g, b] = getPixel(x, y);
        const maxVal = Math.max(r, g, b);
        
        // Soft transition for very dark shadow edges
        if (maxVal < bgThreshold + 20) {
          const factor = Math.max(0, (maxVal - (bgThreshold - 5)) / 25);
          data[p + 3] = Math.round(data[p + 3] * factor);
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 92, alphaQuality: 95 })
    .toFile(dest);

  console.log('Saved cutout:', dest);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Processing approach assets...');
  await processEnvironment();

  await makeCutout('strategy_cutout_1792424386294.jpg', 'strategy-cutout.webp', {
    bgThreshold: 22,
  });

  await makeCutout('design_cutout_clean_1792424786262.jpg', 'design-cutout.webp', {
    bgThreshold: 24,
  });

  await makeCutout('experience_cutout_1792424457682.jpg', 'experience-cutout.webp', {
    bgThreshold: 24,
  });

  await makeCutout('technology_cutout_1792424499182.jpg', 'technology-cutout.webp', {
    bgThreshold: 24,
  });

  console.log('All approach assets generated successfully!');
}

main().catch(console.error);
