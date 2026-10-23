const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.resolve('.chrome-temp-rendered');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 3055;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES_TO_TEST = [
  `${BASE}/`,
  `${BASE}/services/brand-identity`,
  `${BASE}/works`,
  `${BASE}/about-us`,
  `${BASE}/contact`,
];

async function verifyRenderedDom() {
  console.log(`Starting production server on port ${PORT}...`);
  const serverProc = spawn('node', ['server/production.cjs'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  await new Promise((resolve) => {
    serverProc.stdout.on('data', (d) => {
      if (d.toString().includes('Listening')) {
        resolve();
      }
    });
  });

  console.log('Starting Chrome headless with CDP to audit live rendered DOM...');
  const proc = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9224',
      '--user-data-dir=' + tempDir,
      '--window-size=1440,1000',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch('http://127.0.0.1:9224/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('CDP failed to start');
    proc.kill();
    serverProc.kill();
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

  await new Promise((r) => (ws.onopen = r));

  const {
    result: { targetId },
  } = await send('Target.createTarget', { url: 'about:blank' });
  const {
    result: { sessionId },
  } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  };

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');

  console.log('\n================================================================================');
  console.log('ENTROPY — PRODUCTION RENDERED DOM AUDIT (JAVASCRIPT EXECUTED IN CHROME)');
  console.log('================================================================================\n');

  for (const url of ROUTES_TO_TEST) {
    await sendSession('Page.navigate', { url });
    // Wait for React to mount, router to resolve, and RouteMetadata to update document
    await new Promise((r) => setTimeout(r, 2200));

    const evalRes = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const title = document.title;
        const canonical = document.querySelector('link[rel="canonical"]')?.href || 'NONE';
        const h1 = document.querySelector('h1')?.innerText?.trim() || 'NONE';
        const description = document.querySelector('meta[name="description"]')?.content || 'NONE';
        const rootChildCount = document.getElementById('root')?.childElementCount || 0;
        return { title, canonical, h1, description, rootChildCount };
      })()`,
      returnByValue: true,
    });

    const info = evalRes.result?.result?.value || evalRes.result?.value || {};
    const routeName = url.replace(BASE, '') || '/';
    console.log(`[RENDERED] ${routeName}`);
    console.log(`  Title:       ${info.title}`);
    console.log(`  Canonical:   ${info.canonical}`);
    console.log(`  H1:          ${(info.h1 || '').replace(/\\n/g, ' ')}`);
    console.log(`  Description: ${(info.description || '').substring(0, 75)}...`);
    console.log(`  DOM Nodes:   ${info.rootChildCount} top-level children in #root`);
    console.log('');
  }

  ws.close();
  proc.kill();
  serverProc.kill();
  console.log('Production rendered DOM verification complete. Server stopped.');
}

verifyRenderedDom().catch((err) => {
  console.error('Fatal CDP error:', err);
  process.exit(1);
});
