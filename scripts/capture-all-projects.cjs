const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.resolve('.chrome-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const projectsDir = path.resolve('public/projects');
if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const projectList = [
  { id: 'glitch', name: 'GLITCH', file: 'glitch.webp', url: 'https://glitchcolhing.netlify.app/' },
  { id: 'beyond-growth', name: 'BEYOND GROWTH', file: 'beyond-growth.webp', url: 'https://beyondgrowth.netlify.app/' },
  { id: 'lumina', name: 'LUMINA', file: 'lumina.webp', url: 'https://luminawebagencie.netlify.app/' },
  { id: 'journey-ai', name: 'JOURNEY AI', file: 'journey-ai.webp', url: 'https://journeywithai.netlify.app/' },
  { id: 'snow-luxury', name: 'SNOW LUXURY', file: 'snow-luxury.webp', url: 'https://snowluxury.netlify.app/' },
  { id: 'builder-aura', name: 'BUILDERAURA', file: 'builder-aura.webp', url: 'https://buidleraura.netlify.app/' },
  { id: 'voltix-aura', name: 'VOLTIXAURA', file: 'voltix-aura.webp', url: 'https://voltixaura.netlify.app/' },
  { id: 'japan-escape', name: 'TRAVEL JAPAN ESCAPE', file: 'japan-escape.webp', url: 'https://traveljapanescape.netlify.app/' },
  { id: 'quiet-shelf', name: 'QUIET SHELF', file: 'quiet-shelf.webp', url: 'https://quiteshelf.netlify.app/' },
  { id: 'hiroshi-archive', name: 'HIROSHI / SAMURAI', file: 'hiroshi-archive.webp', url: 'https://hiroshi-samurai.netlify.app/' },
];

async function run() {
  console.log('Launching headless Chrome with CDP...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,1000',
    '--hide-scrollbars',
    'about:blank'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to CDP');
    proc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);

  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  };

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  const metadataResults = [];

  for (let i = 0; i < projectList.length; i++) {
    const p = projectList[i];
    console.log(`\n[${i + 1}/${projectList.length}] Loading ${p.name} (${p.url})...`);
    
    try {
      await sendSession('Page.navigate', { url: p.url });
      
      // Wait for page to render styles, fonts, and images
      await new Promise(r => setTimeout(r, 3800));

      // Extract real page title, h1, body snippets to understand its exact category & tagline
      const evalRes = await sendSession('Runtime.evaluate', {
        expression: `({
          title: document.title || '',
          h1: (document.querySelector('h1')?.innerText || '').replace(/\\s+/g, ' ').trim(),
          h2: (document.querySelector('h2')?.innerText || '').replace(/\\s+/g, ' ').trim(),
          metaDesc: (document.querySelector('meta[name="description"]')?.content || '').trim(),
          navBrand: (document.querySelector('header a, nav a, .logo, [class*="brand"], [class*="logo"]')?.innerText || '').replace(/\\s+/g, ' ').trim()
        })`,
        returnByValue: true
      });

      const meta = evalRes.result?.value || {};
      console.log('   Title:', meta.title);
      console.log('   H1:', meta.h1);
      console.log('   H2:', meta.h2);
      console.log('   Brand:', meta.navBrand);

      // Capture screenshot
      const snapRes = await sendSession('Page.captureScreenshot', {
        format: 'webp',
        quality: 85
      });

      const outPath = path.join(projectsDir, p.file);
      fs.writeFileSync(outPath, Buffer.from(snapRes.result.data, 'base64'));
      const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`   Captured: ${p.file} (${sizeKB} KB)`);

      metadataResults.push({
        ...p,
        ...meta,
        sizeKB
      });
    } catch (err) {
      console.error(`   Error capturing ${p.name}:`, err.message);
    }
  }

  // Save metadata to file
  fs.writeFileSync(path.resolve('scripts/projects-metadata.json'), JSON.stringify(metadataResults, null, 2));
  console.log('\nAll projects captured and metadata saved to scripts/projects-metadata.json');

  ws.close();
  proc.kill();
}

run().catch(console.error);
