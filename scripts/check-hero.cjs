const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tempDir = path.resolve('.chrome-temp-hero');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkHero() {
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tempDir,
    '--window-size=1440,1000',
    'http://localhost:3000/'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch('http://127.0.0.1:9225/json');
      const list = await res.json();
      const page = list.find(p => p.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('CDP page not found');
    proc.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[Browser Console]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Exception]', JSON.stringify(msg.params.exceptionDetails));
    }
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    callbacks.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Runtime.enable');
  await send('Page.enable');

  // Wait 4 seconds for hero animations and WebGL
  await new Promise(r => setTimeout(r, 4000));

  const state = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const hero = document.querySelector('#hero');
        const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
          width: c.width,
          height: c.height,
          className: c.className,
          parentElement: c.parentElement?.tagName + '.' + c.parentElement?.className
        }));
        const logoSlot = document.querySelector('#hero-wordmark-logo-slot');
        const logoCanvas = logoSlot ? logoSlot.querySelector('canvas') : null;
        const wordmark = document.querySelector('h1')?.innerText;

        return JSON.stringify({
          heroFound: Boolean(hero),
          heroChildren: hero ? hero.children.length : 0,
          canvasesCount: canvases.length,
          canvases,
          logoSlotFound: Boolean(logoSlot),
          logoSlotHtml: logoSlot ? logoSlot.innerHTML : null,
          hasLogoCanvas: Boolean(logoCanvas),
          wordmark
        });
      })()
    `,
    returnByValue: true
  });

  console.log('Hero State:', state.result?.result?.value);

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  if (ss.result?.data) {
    fs.writeFileSync('hero-check.png', Buffer.from(ss.result.data, 'base64'));
    console.log('Saved hero-check.png');
  }

  ws.close();
  proc.kill();
}

checkHero().catch(console.error);
