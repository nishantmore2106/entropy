const { spawn } = require('child_process');
const http = require('http');

const PORT = 3050;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES_TO_TEST = [
  { path: '/', expectedTitle: 'ENTROPY', expectedH1: 'ENTROPY', expectedType: 'Organization' },
  { path: '/about-us', expectedTitle: 'About Us', expectedH1: 'About ENTROPY', expectedType: 'AboutPage' },
  { path: '/services', expectedTitle: 'Services & Capabilities', expectedH1: 'Capabilities & Disciplines', expectedType: 'CollectionPage' },
  { path: '/works', expectedTitle: 'Selected Work', expectedH1: 'Selected Works', expectedType: 'CollectionPage' },
  { path: '/contact', expectedTitle: 'Start a Project', expectedH1: 'Start Your Project', expectedType: 'ContactPage' },
  { path: '/services/brand-identity', expectedTitle: 'Brand Identity Design', expectedH1: 'Brand Identity', expectedType: 'Service' },
  { path: '/services/brand-strategy', expectedTitle: 'Brand Strategy', expectedH1: 'Brand Strategy', expectedType: 'Service' },
  { path: '/services/logo-design', expectedTitle: 'Custom Logo Design', expectedH1: 'Logo Design', expectedType: 'Service' },
  { path: '/services/ui-ux-design', expectedTitle: 'UI/UX Design', expectedH1: 'UI/UX Design', expectedType: 'Service' },
  { path: '/services/website-design', expectedTitle: 'Custom Website Design', expectedH1: 'Website Design', expectedType: 'Service' },
  { path: '/services/website-development', expectedTitle: 'Custom Website Development', expectedH1: 'Website Development', expectedType: 'Service' },
  { path: '/services/ecommerce-development', expectedTitle: 'E-commerce Website Design', expectedH1: 'E-commerce Development', expectedType: 'Service' },
  { path: '/services/landing-pages', expectedTitle: 'Landing Page Design', expectedH1: 'Landing Pages', expectedType: 'Service' },
  { path: '/services/motion-interaction-design', expectedTitle: 'Motion & Interaction Design', expectedH1: 'Motion & Interaction Design', expectedType: 'Service' },
  { path: '/services/digital-product-development', expectedTitle: 'Digital Product Development', expectedH1: 'Digital Product Development', expectedType: 'Service' },
];

function fetchRaw(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

async function runVerification() {
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

  console.log('\n================================================================================');
  console.log('ENTROPY — RAW HTTP CRAWLER AUDIT (NO JAVASCRIPT EXECUTION)');
  console.log('================================================================================\n');

  const results = [];

  for (const item of ROUTES_TO_TEST) {
    try {
      const res = await fetchRaw(item.path);
      const html = res.body;

      const titleMatch = html.match(/<title>(.*?)<\/title>/s);
      const title = titleMatch ? titleMatch[1].trim() : 'NONE';

      const canonicalMatch = html.match(/<link rel="canonical" href="(.*?)"/);
      const canonical = canonicalMatch ? canonicalMatch[1] : 'NONE';

      const descMatch = html.match(/<meta name="description" content="(.*?)"/);
      const desc = descMatch ? descMatch[1] : 'NONE';

      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
      const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NONE';

      const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
      let schemaType = 'NONE';
      if (jsonLdMatch) {
        try {
          const parsed = JSON.parse(jsonLdMatch[1]);
          if (parsed['@graph']) {
            schemaType = parsed['@graph'].map((g) => g['@type']).flat().join(', ');
          } else {
            schemaType = Array.isArray(parsed['@type']) ? parsed['@type'].join(', ') : parsed['@type'];
          }
        } catch (e) {
          schemaType = 'PARSE_ERROR';
        }
      }

      const hasHomepageLeak =
        item.path !== '/' &&
        (h1 === 'ENTROPY — Brand × Design × Technology' ||
          title === 'ENTROPY — Creative Technology Studio | Brand, Design & Technology');

      const isPass =
        res.statusCode === 200 &&
        title.toLowerCase().includes(item.expectedTitle.toLowerCase().split(' ')[0]) &&
        h1.toLowerCase().includes(item.expectedH1.toLowerCase().split(' ')[0]) &&
        !hasHomepageLeak;

      results.push({
        path: item.path,
        statusCode: res.statusCode,
        title,
        h1,
        canonical,
        schemaType,
        hasHomepageLeak,
        isPass,
      });

      console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${item.path}`);
      console.log(`       Status: ${res.statusCode} | Canonical: ${canonical}`);
      console.log(`       Title:  ${title}`);
      console.log(`       H1:     ${h1}`);
      console.log(`       Schema: ${schemaType}`);
      if (hasHomepageLeak) {
        console.log(`       WARNING: Leaked homepage content into sub-route!`);
      }
      console.log('');
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${item.path}:`, err.message);
      results.push({ path: item.path, isPass: false, error: err.message });
    }
  }

  // Also verify robots.txt
  console.log('\n--- VERIFYING ROBOTS.TXT ---');
  const robotsRes = await fetchRaw('/robots.txt');
  console.log(`Status: ${robotsRes.statusCode}`);
  const hasOaiSearchBot = robotsRes.body.includes('User-agent: OAI-SearchBot');
  const hasGptBot = robotsRes.body.includes('User-agent: GPTBot');
  const hasSitemap = robotsRes.body.includes('Sitemap: https://entropy.design/sitemap.xml');
  console.log(`Contains OAI-SearchBot: ${hasOaiSearchBot}`);
  console.log(`Contains GPTBot:         ${hasGptBot}`);
  console.log(`Contains Sitemap URL:    ${hasSitemap}`);

  // Also verify sitemap.xml
  console.log('\n--- VERIFYING SITEMAP.XML ---');
  const sitemapRes = await fetchRaw('/sitemap.xml');
  console.log(`Status: ${sitemapRes.statusCode}`);
  const urlCount = (sitemapRes.body.match(/<loc>/g) || []).length;
  console.log(`Total URLs in sitemap:  ${urlCount}`);

  serverProc.kill();
  console.log('\nVerification complete. Server stopped.');
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
