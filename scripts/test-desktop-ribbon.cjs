const { spawn } = require('child_process');
const fs = require('fs');

async function testDesktop() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp-test2';
  const proc = spawn(chromePath, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9227',
    '--user-data-dir=' + tempDir, '--window-size=1440,900', 'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9227/json/version');
      const data = await res.json();
      if (data.webSocketDebuggerUrl) {
        var wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch(e) {}
  }

  const ws = new WebSocket(wsUrl);
  let id = 1; const cbs = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m); cbs.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const mid = id++; cbs.set(mid, r); ws.send(JSON.stringify({ id: mid, method, params })); });
  await new Promise(r => ws.onopen = r);
  const t = await send('Target.createTarget', { url: 'about:blank' });
  const a = await send('Target.attachToTarget', { targetId: t.result.targetId, flatten: true });
  const sid = a.result.sessionId;
  const sendS = (method, params = {}) => new Promise(r => { const mid = id++; cbs.set(mid, r); ws.send(JSON.stringify({ id: mid, sessionId: sid, method, params })); });
  await sendS('Page.enable');
  await sendS('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 3000));
  const info = await sendS('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.getElementById("studio-capabilities-ribbon");
        if (!el) return { error: 'No element' };
        const rect = el.getBoundingClientRect();
        const canvas = el.querySelector('canvas');
        return {
          top: rect.top,
          height: rect.height,
          scrollY: window.scrollY,
          canvasWidth: canvas?.width,
          canvasHeight: canvas?.height,
          canvasDisplay: canvas ? window.getComputedStyle(canvas).display : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('RIBBON INFO:', info.result.value);

  await sendS('Runtime.evaluate', {
    expression: `
      const el = document.getElementById("studio-capabilities-ribbon");
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  const shot = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33727a92-66b1-4434-9869-f4f94939af1b\\verify_ribbon_desktop_centered.png', Buffer.from(shot.result.data, 'base64'));
  ws.close();
  try { proc.kill(); } catch (e) {}
  console.log('Saved verify_ribbon_desktop_centered.png');
}

testDesktop().catch(console.error);
