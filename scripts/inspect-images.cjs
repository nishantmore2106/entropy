async function test() {
  const v = await fetch('http://127.0.0.1:9223/json/version').then(r => r.json());
  const ws = new WebSocket(v.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const mid = id++;
    const handler = (e) => {
      const d = JSON.parse(eventData(e));
      if (d.id === mid) { ws.removeEventListener('message', handler); res(d); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });
  function eventData(e) { return e.data; }

  const t = await send('Target.createTarget', { url: 'http://localhost:3000/#selected-work' });
  const a = await send('Target.attachToTarget', { targetId: t.result.targetId, flatten: true });
  const sid = a.result.sessionId;

  const sendS = (m, p = {}) => new Promise(res => {
    const mid = id++;
    const handler = (e) => {
      const d = JSON.parse(eventData(e));
      if (d.id === mid) { ws.removeEventListener('message', handler); res(d); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, sessionId: sid, method: m, params: p }));
  });

  await new Promise(r => setTimeout(r, 2000));
  const ev = await sendS('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('#selected-work img')).map(i => ({ src: i.src, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, complete: i.complete }))`,
    returnByValue: true
  });
  console.log(JSON.stringify(ev?.result?.value, null, 2));
  ws.close();
}
test().catch(console.error);
