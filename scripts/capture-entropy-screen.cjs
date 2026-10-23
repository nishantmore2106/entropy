const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.resolve('.chrome-temp-card');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching headless Chrome...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tempDir,
    '--window-size=1440,900',
    '--hide-scrollbars',
    'about:blank'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to CDP on 9225');
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
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });

  // 1. Capture Homepage Hero
  console.log('Navigating to http://localhost:3000/ ...');
  await sendSession('Page.navigate', { url: 'http://localhost:3000/' });
  // Wait for intro transition (if any) and voxel arc animation to fully settle
  await wait(3500);

  const snapHome = await sendSession('Page.captureScreenshot', { format: 'png' });
  if (snapHome?.result?.data) {
    fs.writeFileSync('public/services/entropy-home-raw.png', Buffer.from(snapHome.result.data, 'base64'));
    console.log('Saved public/services/entropy-home-raw.png');
  }

  // 2. Capture Works page
  console.log('Navigating to http://localhost:3000/works ...');
  await sendSession('Page.navigate', { url: 'http://localhost:3000/works' });
  await wait(2500);

  const snapWorks = await sendSession('Page.captureScreenshot', { format: 'png' });
  if (snapWorks?.result?.data) {
    fs.writeFileSync('public/services/entropy-works-raw.png', Buffer.from(snapWorks.result.data, 'base64'));
    console.log('Saved public/services/entropy-works-raw.png');
  }

  ws.close();
  proc.kill();
  console.log('Screenshots captured successfully!');
}

capture();
