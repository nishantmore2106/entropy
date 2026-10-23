const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp-uiux-works';
  const artifactDir = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33727a92-66b1-4434-9869-f4f94939af1b';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9233',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,1100',
    'about:blank'
  ], {
    env: { ...process.env, TEMP: tempDir, TMP: tempDir },
    stdio: 'ignore'
  });

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await wait(300);
    try {
      const res = await fetch('http://127.0.0.1:9233/json/version');
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

  await new Promise(resolve => ws.onopen = resolve);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  console.log('Navigating to http://localhost:3000/works ...');
  await send('Page.navigate', { url: 'http://localhost:3000/works' });
  await wait(3000);

  // 1. Capture Works Page All view (scroll to reveal top cards)
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 380);' });
  await wait(1000);

  let snapAll = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_works_all_uiux.png'), Buffer.from(snapAll.result.data, 'base64'));
  console.log('Saved verify_works_all_uiux.png');

  // 2. Click on "UI/UX" filter button
  console.log('Clicking UI/UX filter button...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('nav[aria-label="Filter works by industry category"] button'));
        const uiuxBtn = btns.find(b => b.textContent.trim() === 'UI/UX');
        if (uiuxBtn) {
          uiuxBtn.click();
          return 'clicked UI/UX';
        }
        return 'button not found';
      })()
    `
  });
  await wait(1200);

  let snapUiUx = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_works_uiux_filter.png'), Buffer.from(snapUiUx.result.data, 'base64'));
  console.log('Saved verify_works_uiux_filter.png');

  // 3. Click on the first card (PULSE) to open CaseStudyModal
  console.log('Clicking PULSE card to open modal...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = document.querySelectorAll('section[aria-label="Portfolio Project Gallery"] a');
        if (cards.length > 0) {
          cards[0].click();
          return 'clicked first card';
        }
        return 'no cards found';
      })()
    `
  });
  await wait(1200);

  let snapModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_works_pulse_modal.png'), Buffer.from(snapModal.result.data, 'base64'));
  console.log('Saved verify_works_pulse_modal.png');

  ws.close();
  try { proc.kill(); } catch(e) {}
  console.log('Verification completed successfully.');
}

run().catch(console.error);
