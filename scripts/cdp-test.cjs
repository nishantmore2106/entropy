const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.resolve('.chrome-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('Starting Chrome headless with CDP...');
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

  // Wait for CDP to be ready
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('CDP failed to start');
    proc.kill();
    return;
  }

  console.log('CDP Connected:', wsUrl);
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

  // Create new page target
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
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to GLITCH...');
  await sendSession('Page.navigate', { url: 'https://glitchcolhing.netlify.app/' });

  // Wait 4 seconds for fonts, models, images to render
  console.log('Waiting for render...');
  await new Promise(r => setTimeout(r, 4000));

  console.log('Capturing screenshot...');
  const snapRes = await sendSession('Page.captureScreenshot', {
    format: 'webp',
    quality: 85
  });

  const outPath = path.resolve('public/projects/glitch.webp');
  fs.writeFileSync(outPath, Buffer.from(snapRes.result.data, 'base64'));
  console.log('Saved to:', outPath, 'Size:', fs.statSync(outPath).size);

  ws.close();
  proc.kill();
}

capture().catch(console.error);
