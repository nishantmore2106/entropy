const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildCraftedWebsitesCard() {
  const width = 1264;
  const height = 848;

  // 1. Coordinates and dimensions matching the reference
  const windowX = Math.round(width * 0.2386); // ~302
  const windowY = Math.round(height * 0.1717); // ~146
  const windowW = width - windowX; // 962
  const windowH = height - windowY; // 702
  const cornerRadius = 24;

  const pillX = Math.round(width * 0.048); // ~61
  const pillY = Math.round(height * 0.865); // ~734
  const pillW = Math.round(width * 0.155); // ~196
  const pillH = Math.round(height * 0.075); // ~64

  console.log('Window geometry:', { windowX, windowY, windowW, windowH });
  console.log('Pill geometry:', { pillX, pillY, pillW, pillH });

  // 2. Generate the base blue gradient background with technical dot grid
  // Reference sampled colors:
  // Top: #2679c2
  // Bottom: #073e73
  // Dot matrix: ~42px spacing, 1.5px radius, white with 0.14 opacity
  const dotsSvg = [];
  const spacing = 42;
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      dotsSvg.push(`<circle cx="${x}" cy="${y}" r="1.5" fill="rgba(255,255,255,0.15)" />`);
    }
  }

  const bgSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#287bc2" />
        <stop offset="50%" stop-color="#145da0" />
        <stop offset="100%" stop-color="#073e73" />
      </linearGradient>
      <!-- Drop shadow for the floating website card -->
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-18" dy="18" stdDeviation="22" flood-color="#02162e" flood-opacity="0.65" />
      </filter>
      <!-- Shadow for the Custom pill -->
      <filter id="pillShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#031f3d" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- Base Gradient -->
    <rect width="${width}" height="${height}" fill="url(#blueGrad)" />

    <!-- Technical Dot Grid -->
    ${dotsSvg.join('')}

    <!-- Shadow under the floating website card -->
    <path d="M ${windowX + cornerRadius} ${windowY}
             L ${width} ${windowY}
             L ${width} ${height}
             L ${windowX} ${height}
             L ${windowX} ${windowY + cornerRadius}
             Q ${windowX} ${windowY} ${windowX + cornerRadius} ${windowY} Z"
          fill="#000000"
          filter="url(#cardShadow)" />
  </svg>
  `;

  // 3. Prepare the website screenshot to fit into windowW x windowH
  // Source screenshot: home_page_1792661502185.png (1920x912)
  const homeScreenshotPath = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33e93adf-8eba-4883-a79f-631796d1afd1\\home_page_1792661502185.png';
  
  // Crop and resize the website screenshot so the iconic ENTROPY branding, wordmark, and voxel arc horizon are prominent
  const websiteImgBuffer = await sharp(homeScreenshotPath)
    .extract({
      left: 160,
      top: 0,
      width: 1600,
      height: 912
    })
    .resize(windowW, windowH, {
      fit: 'cover',
      position: 'top'
    })
    .toBuffer();

  // 4. Create rounded top-left corner mask for the website card
  const cardMaskSvg = `
  <svg width="${windowW}" height="${windowH}" viewBox="0 0 ${windowW} ${windowH}" xmlns="http://www.w3.org/2000/svg">
    <path d="M ${cornerRadius} 0
             L ${windowW} 0
             L ${windowW} ${windowH}
             L 0 ${windowH}
             L 0 ${cornerRadius}
             Q 0 0 ${cornerRadius} 0 Z"
          fill="#FFFFFF" />
  </svg>
  `;

  const maskedCard = await sharp(websiteImgBuffer)
    .composite([
      {
        input: Buffer.from(cardMaskSvg),
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  // 5. Card Border overlay (top & left edge rounded border)
  const cardBorderSvg = `
  <svg width="${windowW}" height="${windowH}" viewBox="0 0 ${windowW} ${windowH}" xmlns="http://www.w3.org/2000/svg">
    <path d="M ${cornerRadius} 0.5
             L ${windowW} 0.5
             M 0.5 ${windowH}
             L 0.5 ${cornerRadius}
             Q 0.5 0.5 ${cornerRadius} 0.5"
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          stroke-width="1.5" />
  </svg>
  `;

  // 6. Generate the Custom ✓ Pill button
  // White pill with subtle shadow and crisp typography
  const pillSvg = `
  <svg width="${pillW}" height="${pillH}" viewBox="0 0 ${pillW} ${pillH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="btnShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#042345" flood-opacity="0.32" />
      </filter>
    </defs>
    <rect x="4" y="4" width="${pillW - 8}" height="${pillH - 8}" rx="${(pillH - 8) / 2}" fill="#FFFFFF" filter="url(#btnShadow)" />
    <!-- Text: Custom ✓ -->
    <text x="${(pillW) / 2}" y="${(pillH) / 2 + 8}" 
          font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="22" 
          font-weight="700" 
          fill="#1E293B" 
          text-anchor="middle" 
          letter-spacing="0.3">
      Custom <tspan font-size="20" fill="#0EA5E9" font-weight="800">✓</tspan>
    </text>
  </svg>
  `;

  // 7. Composite everything together
  const finalComposition = await sharp(Buffer.from(bgSvg))
    .composite([
      {
        input: maskedCard,
        top: windowY,
        left: windowX,
      },
      {
        input: Buffer.from(cardBorderSvg),
        top: windowY,
        left: windowX,
      },
      {
        input: Buffer.from(pillSvg),
        top: pillY,
        left: pillX,
      }
    ])
    .webp({ quality: 95 })
    .toFile('public/services/crafted-websites.webp');

  console.log('Saved public/services/crafted-websites.webp:', finalComposition);

  // Also save crafted-websites-preview.png as requested by prompt
  await sharp('public/services/crafted-websites.webp')
    .png()
    .toFile('public/services/crafted-websites-preview.png');
  
  console.log('Saved public/services/crafted-websites-preview.png');
}

buildCraftedWebsitesCard().catch(console.error);
