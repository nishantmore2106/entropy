const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeSeamless() {
  const triptychSrc = path.resolve(__dirname, '../public/uiux/redesig it/image.png');
  const triptych = await sharp(triptychSrc)
    .resize({ height: 960 })
    .toBuffer();

  const metaTrip = await sharp(triptych).metadata();

  const splitY = 20 + Math.round(960 * (1438 / 2675));
  const svgBg = Buffer.from(`
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="1600" height="${splitY}" fill="#736f56"/>
      <rect x="0" y="${splitY}" width="1600" height="${1000 - splitY}" fill="#b59667"/>
    </svg>
  `);

  await sharp(svgBg)
    .composite([{
      input: triptych,
      left: Math.round((1600 - metaTrip.width) / 2),
      top: 20
    }])
    .webp({ quality: 92 })
    .toFile(path.resolve(__dirname, '../public/projects/redesign-it.webp'));

  console.log('Created seamless redesign-it.webp');
}

makeSeamless().catch(console.error);
