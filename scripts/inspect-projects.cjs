const https = require('https');

const projects = [
  { id: 'glitch', url: 'https://glitchcolhing.netlify.app/' },
  { id: 'beyond-growth', url: 'https://beyondgrowth.netlify.app/' },
  { id: 'lumina', url: 'https://luminawebagencie.netlify.app/' },
  { id: 'journey-ai', url: 'https://journeywithai.netlify.app/' },
  { id: 'snow-luxury', url: 'https://snowluxury.netlify.app/' },
  { id: 'builder-aura', url: 'https://buidleraura.netlify.app/' },
  { id: 'voltix-aura', url: 'https://voltixaura.netlify.app/' },
  { id: 'japan-escape', url: 'https://traveljapanescape.netlify.app/' },
  { id: 'quiet-shelf', url: 'https://quiteshelf.netlify.app/' },
  { id: 'hiroshi-archive', url: 'https://hiroshi-samurai.netlify.app/' },
];

async function inspect(p) {
  try {
    const res = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const text = await res.text();
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const h1Match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const metaDesc = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    
    console.log(`\n=== [${p.id}] ${p.url} ===`);
    console.log('STATUS:', res.status);
    console.log('TITLE:', titleMatch ? titleMatch[1].trim() : '(none)');
    console.log('H1:', h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '(none)');
    console.log('DESC:', metaDesc ? metaDesc[1].trim() : '(none)');
  } catch (err) {
    console.error(`ERROR [${p.id}]:`, err.message);
  }
}

async function run() {
  for (const p of projects) {
    await inspect(p);
  }
}

run();
