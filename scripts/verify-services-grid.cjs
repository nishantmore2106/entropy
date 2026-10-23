const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp-services-verify';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9228',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,1400',
    'about:blank'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      const res = await fetch('http://127.0.0.1:9228/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to get wsUrl');
    try { proc.kill(); } catch (e) {}
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

  const send = (method, params = {}) => new Promise(res => {
    const mid = id++;
    callbacks.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  const t = await send('Target.createTarget', { url: 'about:blank' });
  const a = await send('Target.attachToTarget', { targetId: t.result.targetId, flatten: true });
  const sid = a.result.sessionId;

  const sendS = (method, params = {}) => new Promise(res => {
    const mid = id++;
    callbacks.set(mid, res);
    ws.send(JSON.stringify({ id: mid, sessionId: sid, method, params }));
  });

  await sendS('Page.enable');
  await sendS('Runtime.enable');

  const artifactDir = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33727a92-66b1-4434-9869-f4f94939af1b';

  // 1. Capture Services Page Grid Row 1 & 2 (Desktop: 1440x1400)
  console.log('1. Checking Services Page on Desktop...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/services' });
  await wait(3500);

  const shotServicesDesktop1 = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_services_grid_top.png'), Buffer.from(shotServicesDesktop1.result.data, 'base64'));
  console.log('Saved verify_services_grid_top.png');

  // Scroll down to see the bottom rows
  await sendS('Runtime.evaluate', {
    expression: 'window.scrollTo(0, 500);'
  });
  await wait(1000);

  const shotServicesDesktop2 = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_services_grid_bottom.png'), Buffer.from(shotServicesDesktop2.result.data, 'base64'));
  console.log('Saved verify_services_grid_bottom.png');

  ws.close();
  try { proc.kill(); } catch (e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  console.log('Services grid captures complete!');
}

run().catch(console.error);
