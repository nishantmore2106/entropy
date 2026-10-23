const { spawn } = require('child_process');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testClick() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9226',
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
      const res = await fetch('http://127.0.0.1:9226/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
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
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
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
  await sendS('Console.enable');

  console.log('Navigating...');
  await sendS('Page.navigate', { url: 'http://localhost:3000/#selected-work' });
  await wait(7000);

  const beforeClick = await sendS('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 100)',
    returnByValue: true
  });
  console.log('BEFORE CLICK:', beforeClick?.result?.value);

  console.log('Clicking button...');
  const clickRes = await sendS('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('View All Projects'));
        if (!btn) return 'BUTTON NOT FOUND';
        btn.click();
        return 'BUTTON CLICKED';
      })()
    `,
    returnByValue: true
  });
  console.log('CLICK RESULT:', clickRes?.result?.value);

  await wait(2000);

  const afterClick = await sendS('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 200)',
    returnByValue: true
  });
  console.log('AFTER CLICK:', afterClick?.result?.value);

  ws.close();
  try { proc.kill(); } catch(e) {}
}

testClick().catch(console.error);
