const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempDir = 'D:\\entropy-—-creative-technology-studio\\.chrome-temp-verify';

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tempDir,
    '--disk-cache-dir=' + tempDir,
    '--window-size=1440,900',
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

  const artifactDir = 'C:\\Users\\Nishant More\\.gemini\\antigravity-ide\\brain\\33727a92-66b1-4434-9869-f4f94939af1b';

  // 1. Verify Crafted Websites Card on Services Page (Desktop: 1440x900)
  console.log('1. Checking Services Page on Desktop (1440x900)...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/services' });
  await wait(3500);

  const shotServicesDesktop = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_services_desktop.png'), Buffer.from(shotServicesDesktop.result.data, 'base64'));
  console.log('Saved verify_services_desktop.png');

  // 2. Verify Crafted Websites Card on Services Page (Mobile: 390x844)
  console.log('2. Checking Services Page on Mobile (390x844)...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/services' });
  await wait(3500);

  const shotServicesMobile = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_services_mobile.png'), Buffer.from(shotServicesMobile.result.data, 'base64'));
  console.log('Saved verify_services_mobile.png');

  // 3. Verify Ribbon Section on Homepage (Desktop: 1440x900)
  console.log('3. Checking Ribbon Section on Homepage Desktop (1440x900)...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/#studio-capabilities-ribbon' });
  await wait(3500);
  await sendS('Runtime.evaluate', {
    expression: `document.getElementById('studio-capabilities-ribbon')?.scrollIntoView({ block: 'center' });`
  });
  await wait(1000);

  const shotRibbonDesktop = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_ribbon_desktop.png'), Buffer.from(shotRibbonDesktop.result.data, 'base64'));
  console.log('Saved verify_ribbon_desktop.png');

  // 4. Verify Ribbon Section on Homepage (Mobile: 390x844)
  console.log('4. Checking Ribbon Section on Homepage Mobile (390x844)...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/#studio-capabilities-ribbon' });
  await wait(3500);
  await sendS('Runtime.evaluate', {
    expression: `document.getElementById('studio-capabilities-ribbon')?.scrollIntoView({ block: 'center' });`
  });
  await wait(1000);

  const shotRibbonMobile = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_ribbon_mobile.png'), Buffer.from(shotRibbonMobile.result.data, 'base64'));
  console.log('Saved verify_ribbon_mobile.png');

  // 5. Verify Ribbon Section on Homepage (Tablet: 768x1024)
  console.log('5. Checking Ribbon Section on Homepage Tablet (768x1024)...');
  await sendS('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    mobile: false
  });
  await sendS('Page.navigate', { url: 'http://localhost:3000/#studio-capabilities-ribbon' });
  await wait(3500);
  await sendS('Runtime.evaluate', {
    expression: `document.getElementById('studio-capabilities-ribbon')?.scrollIntoView({ block: 'center' });`
  });
  await wait(1000);

  const shotRibbonTablet = await sendS('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_ribbon_tablet.png'), Buffer.from(shotRibbonTablet.result.data, 'base64'));
  console.log('Saved verify_ribbon_tablet.png');

  ws.close();
  try { proc.kill(); } catch (e) {}
  console.log('Verification captures completed successfully!');
}

run().catch(console.error);
