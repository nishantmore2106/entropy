const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function snap(w, h, name) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp-test-' + name;
  const artifactDir = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33727a92-66b1-4434-9869-f4f94939af1b';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9245',
    '--user-data-dir=' + tempDir,
    '--window-size=' + w + ',' + h,
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await wait(250);
    try {
      const res = await fetch('http://127.0.0.1:9245/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch(e) {}
  }
  if (!wsUrl) { proc.kill(); return; }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const cbs = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m); cbs.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(res => {
    const mid = id++;
    cbs.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await wait(2500);

  // Scroll to #selected-work
  await send('Runtime.evaluate', {
    expression: 'document.getElementById("selected-work")?.scrollIntoView({ behavior: "instant", block: "center" })'
  });
  await wait(1200);

  const res = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, name + '.png'), Buffer.from(res.result.data, 'base64'));
  console.log('Saved', name);
  ws.close();
  try { proc.kill(); } catch(e) {}
}

async function run() {
  await snap(390, 844, 'test_wheel_mobile');
  await snap(1440, 900, 'test_wheel_desktop');
}
run().catch(console.error);
