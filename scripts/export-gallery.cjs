const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function exportGallery() {
  const galleryDir = path.resolve(__dirname, '../public/projects/gallery');
  if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
  }

  // Pulse
  const pulseMap = [
    { src: 'image copy 2.png', dst: 'pulse-health.webp', width: 1600 },
    { src: 'image copy 3.png', dst: 'pulse-branding.webp', width: 2000 },
    { src: 'image.png', dst: 'pulse-sleep.webp', width: 1600 },
    { src: 'image copy.png', dst: 'pulse-meditation.webp', width: 1600 },
  ];

  for (const item of pulseMap) {
    const srcPath = path.resolve(__dirname, '../public/uiux/pulse', item.src);
    const dstPath = path.resolve(galleryDir, item.dst);
    await sharp(srcPath)
      .resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(dstPath);
    console.log('Saved', item.dst, fs.statSync(dstPath).size);
  }

  // Redesign it
  const redesignMap = [
    { src: 'image.png', dst: 'redesign-overview.webp', width: 2000 },
    { src: 'image copy.png', dst: 'redesign-board.webp', width: 1200 },
    { src: 'image copy 2.png', dst: 'redesign-create.webp', width: 1200 },
    { src: 'image copy 3.png', dst: 'redesign-profile.webp', width: 1200 },
  ];

  for (const item of redesignMap) {
    const srcPath = path.resolve(__dirname, '../public/uiux/redesig it', item.src);
    const dstPath = path.resolve(galleryDir, item.dst);
    await sharp(srcPath)
      .resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(dstPath);
    console.log('Saved', item.dst, fs.statSync(dstPath).size);
  }

  console.log('All gallery images exported successfully.');
}

exportGallery().catch(console.error);
