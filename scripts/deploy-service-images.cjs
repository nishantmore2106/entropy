const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAPPING = [
  {
    src: 'image copy.png',
    destBase: 'website-redesign',
    title: 'Website Redesign',
  },
  {
    src: 'image.png',
    destBase: 'ecommerce-design',
    title: 'eCommerce Website Design',
  },
  {
    src: 'image copy 3.png',
    destBase: 'cms-dynamic-websites',
    title: 'CMS & Dynamic Websites',
  },
  {
    src: 'image copy 6.png',
    destBase: 'landing-pages',
    title: 'Landing Pages & Microsites',
  },
  {
    src: 'image copy 7.png',
    destBase: 'consistent-identity',
    title: 'Consistent Identity',
  },
  {
    src: 'image copy 4.png',
    destBase: 'ux-strategy',
    title: 'UX-Centric Strategy',
  },
  {
    src: 'image copy 5.png',
    destBase: 'performance-optimization',
    title: 'Performance Optimization',
  },
  {
    src: 'image copy 9.png',
    destBase: 'maintenance-support',
    title: 'Maintenance & Ongoing Support',
  },
  // Also preserve the 2 extra assets with clean names
  {
    src: 'image copy 8.png',
    destBase: 'motion-interaction-design',
    title: 'Motion & Interaction Design',
  },
  {
    src: 'image copy 2.png',
    destBase: 'ecommerce-flow',
    title: 'eCommerce Flow Diagram',
  },
];

async function deploy() {
  const sourceDir = path.join(__dirname, '..', 'public', 'service');
  const targetDir = path.join(__dirname, '..', 'public', 'services');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log('Processing service card images from public/service to public/services...');

  for (const item of MAPPING) {
    const srcPath = path.join(sourceDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source not found: ${srcPath}`);
      continue;
    }

    const pngDest = path.join(targetDir, `${item.destBase}.png`);
    const webpDest = path.join(targetDir, `${item.destBase}.webp`);

    // Copy/save high quality PNG
    await sharp(srcPath)
      .png({ quality: 95 })
      .toFile(pngDest);

    // Save optimized WebP
    await sharp(srcPath)
      .webp({ quality: 92 })
      .toFile(webpDest);

    const statPng = fs.statSync(pngDest);
    const statWebp = fs.statSync(webpDest);

    console.log(`✓ ${item.title}:`);
    console.log(`   PNG:  /services/${item.destBase}.png (${Math.round(statPng.size / 1024)} KB)`);
    console.log(`   WebP: /services/${item.destBase}.webp (${Math.round(statWebp.size / 1024)} KB)`);
  }

  console.log('\nAll service card assets successfully deployed!');
}

deploy().catch(console.error);
