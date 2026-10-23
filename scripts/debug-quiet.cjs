const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const tempDir = path.resolve('.chrome-temp');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testQuiet() {
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9224',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,1000',
    'about:blank'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9224/json/version');
  const { webSocketDebuggerUrl } = await res.json();
  const ws = new WebSocket(webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER LOG:', m.params.args.map(a => a.value));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      console.log('BROWSER EXCEPTION:', m.params.exceptionDetails?.text, m.params.exceptionDetails?.exception?.description);
    }
    if (m.id && callbacks.has(msgId => callbacks.get(msgId)(m)));
    if (m.id && callbacks.has(m.id)) {
      callbacks.get(m.id)(m);
      callbacks.delete(m.id);
    }
  };

  const send = (method, params = {}) => new Promise(res => {
    const msgId = id++;
    callbacks.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => new Promise(res => {
    const msgId = id++;
    callbacks.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
  });

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Page.navigate', { url: 'https://quiteshelf.netlify.app/' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const evalDom = await sendSession('Runtime.evaluate', {
    expression: 'document.body.innerText.slice(0, 300)'
  });
  console.log('Body text:', evalDom.result?.value);

  const snap = await sendSession('Page.captureScreenshot', { format: 'webp', quality: 90 });
  fs.writeFileSync('public/projects/quiet-shelf.webp', Buffer.from(snap.result.data, 'base64'));
  console.log('Saved quiet-shelf.webp size:', fs.statSync('public/projects/quiet-shelf.webp').size);

  ws.close();
  proc.kill();
}
testQuiet().catch(console.error);
