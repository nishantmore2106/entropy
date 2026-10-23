const fs = require('fs');
const { spawn } = require('child_process');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp';

  console.log('Spawning Chrome...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9225',
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
    await wait(400);
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to CDP on port 9225');
    try { proc.kill(); } catch(e) {}
    return;
  }

  console.log('Connecting to WebSocket:', wsUrl);
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

  const send = (method, params = {}, timeoutMs = 15000) => {
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

  console.log('Creating target & attaching session...');
  const createTargetRes = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = createTargetRes?.result?.targetId;
  const attachRes = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attachRes?.result?.sessionId;

  const sendSession = (method, params = {}, timeoutMs = 15000) => {
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

  console.log('Enabling Page & Runtime for session...');
  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to http://localhost:3000/#selected-work...');
  await sendSession('Page.navigate', { url: 'http://localhost:3000/#selected-work' });
  await wait(6000);

  // Scroll directly to selected work section
  await sendSession('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('selected-work');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `
  });
  await wait(4000);

  console.log('Capturing Selected Work Section screenshot...');
  const snap1 = await sendSession('Page.captureScreenshot', { format: 'png' });
  if (snap1 && snap1.result && snap1.result.data) {
    fs.writeFileSync('D:\\entropy-—-creative-technology-studio\\public\\projects\\selected-work-section.png', Buffer.from(snap1.result.data, 'base64'));
    console.log('Saved selected-work-section.png');
  }

  // Click "View All Projects" button
  console.log('Clicking "View All Projects" button...');
  await sendSession('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const viewAllBtn = btns.find(b => b.textContent.includes('View All Projects'));
      if (viewAllBtn) viewAllBtn.click();
    `
  });
  await wait(3000);

  console.log('Capturing "View All Projects" Modal screenshot...');
  const snap2 = await sendSession('Page.captureScreenshot', { format: 'png' });
  if (snap2 && snap2.result && snap2.result.data) {
    fs.writeFileSync('D:\\entropy-—-creative-technology-studio\\public\\projects\\selected-work-view-all.png', Buffer.from(snap2.result.data, 'base64'));
    console.log('Saved selected-work-view-all.png');
  }

  ws.close();
  try { proc.kill(); } catch(e) {}
  console.log('Verification finished successfully.');
}

run().catch(console.error);
