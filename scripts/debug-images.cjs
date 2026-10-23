const { spawn } = require('child_process');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9224',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,1000',
    'about:blank'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await wait(400);
    try {
      const res = await fetch('http://127.0.0.1:9224/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('No wsUrl');
    proc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Console.messageAdded') {
        console.log('CONSOLE:', msg.params.message.text);
      }
      if (msg.method === 'Network.responseReceived') {
        console.log('NET:', msg.params.response.url, msg.params.response.status);
      }
      if (msg.method === 'Network.loadingFailed') {
        console.log('NET FAIL:', msg.params.errorText, msg.params);
      }
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
  await sendS('Network.enable');
  await sendS('Console.enable');

  console.log('Navigating to http://localhost:3000/#selected-work...');
  await sendS('Page.navigate', { url: 'http://localhost:3000/#selected-work' });
  await wait(4000);

  const imgInfo = await sendS('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('#selected-work img')).map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }))
    `,
    returnByValue: true
  });

  console.log('IMAGES INFO:', JSON.stringify(imgInfo?.result?.value, null, 2));

  ws.close();
  try { proc.kill(); } catch(e) {}
}

run().catch(console.error);
