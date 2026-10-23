const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', reject);
  });
}

// We want 3 exceptional images:
// 1. editorial-portrait-1: Male chiaroscuro portrait on pitch black (already have photo-1506794778202-cad84cf45f1d which is perfect)
// 2. editorial-collaboration: Creative technologists / team in dark studio with dramatic lighting or screen glow
// 3. editorial-portrait-2: Female portrait with dramatic lighting against deep black background

const targets = [
  // Creative technologist / team working in dark / moody lighting
  {
    name: 'team-dark-screen.jpg',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1920&q=85'
  },
  {
    name: 'tech-screens-dark.jpg',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85'
  },
  {
    name: 'creative-night-studio.jpg',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=85'
  },
  {
    name: 'dark-portrait-female.jpg',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'dark-female-dramatic.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'dark-portrait-male-profile.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'team-neon-dark.jpg',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=85'
  },
  {
    name: 'dark-technologist.jpg',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85'
  }
];

async function main() {
  const dir = path.join(__dirname, '..', 'public', 'assets', 'about');
  for (const t of targets) {
    const dest = path.join(dir, t.name);
    try {
      console.log(`Downloading ${t.name}...`);
      await download(t.url, dest);
      console.log(`Saved ${t.name}`);
    } catch (err) {
      console.error(`Error for ${t.name}:`, err.message);
    }
  }
}

main();
