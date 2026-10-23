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
  console.log('Launching headless Chrome with CDP (with timeouts)...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
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
      const res = await fetch('http://127.0.0.1:9223/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to CDP on port 9223');
    proc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    } catch(e) {}
  };

  const send = (method, params = {}, timeoutMs = 8000) => {
    return new Promise((resolve) => {
      const msgId = id++;
      const timer = setTimeout(() => {
        callbacks.delete(msgId);
        resolve({ error: 'timeout' });
      }, timeoutMs);
      callbacks.set(msgId, (res) => {
        clearTimeout(timer);
        resolve(res);
      });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);

  const createTargetRes = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = createTargetRes?.result?.targetId;
  const attachRes = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attachRes?.result?.sessionId;

  const sendSession = (method, params = {}, timeoutMs = 8000) => {
    return new Promise((resolve) => {
      const msgId = id++;
      const timer = setTimeout(() => {
        callbacks.delete(msgId);
        resolve({ error: 'timeout' });
      }, timeoutMs);
      callbacks.set(msgId, (res) => {
        clearTimeout(timer);
        resolve(res);
      });
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  };

  await sendSession('Page.enable');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Filter projects to capture only those missing or re-capture cleanly
  const toCapture = projectList.filter(p => {
    const filePath = path.join(projectsDir, p.file);
    return !fs.existsSync(filePath) || fs.statSync(filePath).size < 10000;
  });

  console.log(`Need to capture ${toCapture.length} projects:`, toCapture.map(p => p.id).join(', '));

  for (let i = 0; i < toCapture.length; i++) {
    const p = toCapture[i];
    console.log(`\n[${i + 1}/${toCapture.length}] Capturing ${p.name} (${p.url})...`);

    try {
      await sendSession('Page.navigate', { url: p.url }, 10000);
      await new Promise(r => setTimeout(r, 3500));

      const snapRes = await sendSession('Page.captureScreenshot', {
        format: 'webp',
        quality: 85
      }, 10000);

      if (snapRes?.result?.data) {
        const outPath = path.join(projectsDir, p.file);
        fs.writeFileSync(outPath, Buffer.from(snapRes.result.data, 'base64'));
        const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
        console.log(`   Captured: ${p.file} (${sizeKB} KB)`);
      } else {
        console.warn(`   No screenshot data for ${p.name}`);
      }
    } catch (err) {
      console.error(`   Error on ${p.name}:`, err.message);
    }
  }

  console.log('\nCapture pass complete!');
  ws.close();
  proc.kill();
}

run().catch(console.error);
