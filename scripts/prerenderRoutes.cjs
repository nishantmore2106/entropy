/**
 * ENTROPY — Static HTML Prerendering Engine for Vite SPA
 * 
 * Generates route-specific index.html files inside dist/ for all 15 authentic public routes:
 * 1.  / (Homepage)
 * 2.  /about-us
 * 3.  /services
 * 4.  /works
 * 5.  /contact
 * 6.  /services/brand-identity
 * 7.  /services/brand-strategy
 * 8.  /services/logo-design
 * 9.  /services/ui-ux-design
 * 10. /services/website-design
 * 11. /services/website-development
 * 12. /services/ecommerce-development
 * 13. /services/landing-pages
 * 14. /services/motion-interaction-design
 * 15. /services/digital-product-development
 * 
 * Each route HTML file receives:
 * - Route-specific <title>
 * - Route-specific <meta name="description">
 * - Route-specific <link rel="canonical" href="https://entropy.design{path}">
 * - Route-specific Open Graph & Twitter metadata
 * - Route-specific Schema.org JSON-LD
 * - Route-specific semantic HTML fallback inside #root for crawlers without JavaScript
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const templatePath = path.resolve(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('[Prerender Fatal]: dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(templatePath, 'utf8');

const SITE_URL = process.env.VITE_SITE_URL || 'https://entropy.design';

// 10 Core Services Data
const SERVICES = [
  {
    slug: 'brand-identity',
    name: 'Brand Identity',
    title: 'Brand Identity Design & Visual Systems | ENTROPY Studio',
    description: 'We build cohesive brand identity systems—from adaptive logo architectures and typographic hierarchies to digital-first design tokens and comprehensive brand guidelines.',
    problemSolved: 'Fragmented visuals, inconsistent customer touchpoints across web and print, and lack of a structured design system that prevents your brand from building market authority.',
    suitableFor: 'Ambitious startups establishing their market presence, evolving companies outgrowing legacy branding, and enterprises seeking cohesive visual governance across digital platforms.',
    pricingFactors: 'Scope of visual touchpoints (digital tokens, physical collateral, packaging), complexity of typographic licensing, and depth of brand guidelines.',
    inclusions: ['Logo system and variations', 'Color palette and typography', 'Visual identity guidelines', 'Supporting graphic elements', 'Brand mockups and applications'],
    steps: [
      { step: '01', title: 'Discovery & DNA', desc: 'Unearthing company purpose, core values, audience expectations, and competitive differentiation.' },
      { step: '02', title: 'Visual Direction', desc: 'Developing moodboards, conceptual directions, and typographic hierarchies tailored to your market.' },
      { step: '03', title: 'System Construction', desc: 'Engineering the adaptive logo architecture, color tokens, graphic assets, and layout principles.' },
      { step: '04', title: 'Guidelines & Delivery', desc: 'Producing developer-ready design tokens, asset libraries, and comprehensive digital brand guidelines.' },
    ],
  },
  {
    slug: 'brand-strategy',
    name: 'Brand Strategy',
    title: 'Brand Strategy & Market Positioning | ENTROPY Studio',
    description: 'Define your brand positioning, core differentiation, and communicative principles with strategic clarity that guides design systems and business growth.',
    problemSolved: 'Unclear value propositions, commoditized messaging that sounds like competitors, and internal misalignment on company direction that dilutes marketing effectiveness.',
    suitableFor: 'Founders navigating competitive pivots, post-seed startups preparing for market expansion, and established firms realigning their offering with contemporary client expectations.',
    pricingFactors: 'Market research depth, stakeholder interviews required, competitive landscape complexity, and narrative workshops.',
    inclusions: ['Brand positioning and purpose', 'Audience and market analysis', 'Voice, tone, and messaging', 'Competitive differentiation', 'Strategic brand framework'],
    steps: [
      { step: '01', title: 'Diagnostic Audit', desc: 'Analyzing current brand assets, customer feedback, and competitive positioning gaps.' },
      { step: '02', title: 'Audience Insight', desc: 'Mapping key decision-maker personas, emotional drivers, and empirical friction points.' },
      { step: '03', title: 'Positioning Architecture', desc: 'Crafting defensible value pillars, market territory definitions, and key differentiators.' },
      { step: '04', title: 'Messaging Playbook', desc: 'Delivering tone-of-voice frameworks, core pitch statements, and communication guidelines.' },
    ],
  },
  {
    slug: 'logo-design',
    name: 'Logo Design',
    title: 'Custom Logo Design & Symbol Systems | ENTROPY Studio',
    description: 'We design memorable, geometrically balanced logo systems and wordmarks engineered for instant recognition across digital displays and physical touchpoints.',
    problemSolved: 'Generic template logos, poor scalability on mobile viewports/favicons, and visual marks that fail to communicate organizational maturity.',
    suitableFor: 'New ventures requiring an iconic mark, existing brands undertaking an overdue visual modernization, and products launching into crowded visual spaces.',
    pricingFactors: 'Number of unique concept directions explored, trademark search coordination, and motion/kinetic animation requirements.',
    inclusions: ['Primary symbol and wordmark', 'Secondary lockups and stacked variations', 'Monochrome, inverted, and icon versions', 'Clear-space and minimum-scale rules', 'Vector asset package in SVG, EPS, PDF, PNG'],
    steps: [
      { step: '01', title: 'Symbol Exploration', desc: 'Drafting dozens of conceptual geometry vectors and typographic treatments.' },
      { step: '02', title: 'Vector Refinement', desc: 'Aligning selected routes to optical construction grids and mathematical balance.' },
      { step: '03', title: 'Stress-Testing', desc: 'Testing legibility at 16px favicon scale and high-resolution billboards.' },
      { step: '04', title: 'Asset Production', desc: 'Exporting optimized vector formats and lockup specifications.' },
    ],
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    title: 'UI/UX Design & Digital Product Systems | ENTROPY Studio',
    description: 'We transform complex capabilities into intuitive digital experiences with user research, atomic design systems, interactive prototypes, and validated journeys.',
    problemSolved: 'High user churn, confusing customer onboarding, fragmented interfaces, and costly developer friction caused by undocumented designs.',
    suitableFor: 'SaaS platforms, consumer web applications, enterprise internal tools, and venture-backed digital products seeking market-leading usability.',
    pricingFactors: 'Screen count, workflow branch complexity, user role variations, and interactive Figma prototyping fidelity.',
    inclusions: ['User journey and flow mapping', 'Wireframes and information architecture', 'Figma design system with atomic tokens', 'High-fidelity interactive prototype', 'Developer handoff documentation'],
    steps: [
      { step: '01', title: 'User Mapping', desc: 'Deconstructing user goals, permissions, and multi-step cognitive workflows.' },
      { step: '02', title: 'Low-Fi Wireframing', desc: 'Validating information hierarchy and interaction paths rapidly.' },
      { step: '03', title: 'High-Fi System', desc: 'Creating components, auto-layout tokens, micro-interactions, and dark-mode themes.' },
      { step: '04', title: 'Prototype & Handoff', desc: 'Delivering clickable prototypes with developer-ready variable documentation.' },
    ],
  },
  {
    slug: 'website-design',
    name: 'Website Design',
    title: 'Custom Website Design & Digital Art Direction | ENTROPY Studio',
    description: 'Bespoke website art direction balancing cinematic visual expression with responsive usability, spatial rhythm, and developer-ready architectural handoff.',
    problemSolved: 'Generic WordPress/template appearance, lack of visual brand distinction, poor storytelling, and high bounce rates on crucial marketing pages.',
    suitableFor: 'Creative studios, modern brands, B2B technology providers, and market leaders requiring bespoke digital representation.',
    pricingFactors: 'Custom layout count, bespoke 3D/canvas art direction, custom illustrations, and interactive scroll narratives.',
    inclusions: ['Art direction and visual concept', 'Responsive desktop and mobile layouts', 'Interactive prototypes and micro-animations', 'Design system tokens and components', 'Production-ready Figma file'],
    steps: [
      { step: '01', title: 'Mood & Art Direction', desc: 'Establishing visual tone, typographic pairings, and atmospheric depth.' },
      { step: '02', title: 'Layout Architecture', desc: 'Designing responsive page grids balancing white space, scale, and hierarchy.' },
      { step: '03', title: 'Interactive Staging', desc: 'Prototyping scroll transitions, hover physics, and content reveals.' },
      { step: '04', title: 'Implementation Handoff', desc: 'Documenting breakpoints, spacing tokens, and asset manifests for developers.' },
    ],
  },
  {
    slug: 'website-development',
    name: 'Website Development',
    title: 'Custom Website Development & Modern Engineering | ENTROPY Studio',
    description: 'We engineer high-performance, responsive websites using modern standards, modular codebases, sub-second load times, and clean technical SEO foundations.',
    problemSolved: 'Slow page load speeds, bloated CMS plugins, fragile codebases that break during updates, and poor accessibility and SEO compliance.',
    suitableFor: 'Companies migrating away from legacy platforms, teams needing custom interactive frontend engineering, and enterprises requiring clean architecture.',
    pricingFactors: 'API integrations, custom database models, animation complexity (WebGL/Three.js), and backend functionality.',
    inclusions: ['Clean modern codebase (React / Vite / Tailwind)', 'Sub-second load times and performance optimization', 'Semantic HTML5 structure and technical SEO', 'Mobile, tablet, and widescreen responsiveness', 'Source code repository with full documentation'],
    steps: [
      { step: '01', title: 'Architecture Planning', desc: 'Setting up component trees, state management, and build pipeline.' },
      { step: '02', title: 'Frontend Engineering', desc: 'Implementing pixel-perfect responsive layouts with modular CSS/Tailwind.' },
      { step: '03', title: 'Performance Optimization', desc: 'Auditing bundle sizes, image formats, and network waterfalls.' },
      { step: '04', title: 'Security & Deployment', desc: 'Hardening headers, SSL, and deploying to modern edge infrastructure.' },
    ],
  },
  {
    slug: 'ecommerce-development',
    name: 'E-commerce Development',
    title: 'E-commerce Website Design & Storefront Development | ENTROPY',
    description: 'Considered digital commerce storefronts connecting high-resolution product storytelling, frictionless checkout flows, and lightning-fast browsing speeds.',
    problemSolved: 'Cart abandonment, clunky mobile checkout flows, sluggish product filters, and inability to stand out in commoditized marketplaces.',
    suitableFor: 'Direct-to-consumer lifestyle brands, boutique fashion labels, specialty food makers, and innovative product companies selling globally.',
    pricingFactors: 'SKU volume, multi-currency needs, payment gateway integrations, and custom inventory/fulfillment rules.',
    inclusions: ['Custom storefront design and frontend architecture', 'Product catalog, filtering, and detail experiences', 'Cart slide-out and frictionless checkout flows', 'Payment gateway integration and security rules', 'Mobile-first responsive design across all viewports'],
    steps: [
      { step: '01', title: 'Commerce Journey', desc: 'Mapping product discovery, filtering logic, and one-click checkout paths.' },
      { step: '02', title: 'Catalog Engineering', desc: 'Building high-speed product grids with instantaneous variant switching.' },
      { step: '03', title: 'Checkout & Payments', desc: 'Integrating secure payment gateways and customer communication emails.' },
      { step: '04', title: 'Testing & Launch', desc: 'Simulating multi-device purchases, load testing, and inventory sync.' },
    ],
  },
  {
    slug: 'landing-pages',
    name: 'Landing Pages',
    title: 'Landing Page Design & Campaign Microsites | ENTROPY Studio',
    description: 'Focused campaign destinations crafted to communicate value with immediate resonance, narrative pacing, and decisive conversion actions.',
    problemSolved: 'Wasted ad spend on low-converting pages, message mismatch between campaign ads and landing pages, and sluggish mobile loading.',
    suitableFor: 'Product launches, marketing campaigns, waitlist generation, event promotions, and paid acquisition funnels.',
    pricingFactors: 'Page length, custom interactive calculators/tools, motion graphics integration, and A/B variant requirements.',
    inclusions: ['Conversion-focused information architecture', 'Compelling headline framing and narrative structure', 'Custom visual elements, icons, and product cards', 'Integrated lead capture form with backend storage', 'Blazing-fast load speeds for paid traffic funnels'],
    steps: [
      { step: '01', title: 'Funnel Strategy', desc: 'Aligning headline copy with traffic intent and emotional buying triggers.' },
      { step: '02', title: 'Pacing & Wireframe', desc: 'Structuring visual rhythm so prospects stay engaged through the CTA.' },
      { step: '03', title: 'High-Impact Visuals', desc: 'Crafting product mockups, benefit illustrations, and social proof layouts.' },
      { step: '04', title: 'Tracking & Launch', desc: 'Wiring conversion event analytics, form validation, and edge hosting.' },
    ],
  },
  {
    slug: 'motion-interaction-design',
    name: 'Motion & Interaction Design',
    title: 'Motion & Interaction Design | ENTROPY Studio',
    description: 'We craft purposeful motion, physics-based transitions, and kinetic details that give digital experiences emotional resonance without compromising speed.',
    problemSolved: 'Static, lifeless websites that fail to hold user attention, disjointed route jumps that disorient visitors, and heavy animations that cause scroll lag.',
    suitableFor: 'Creative agencies, high-end lifestyle brands, technology companies, and digital flagships looking to create an unforgettable impression.',
    pricingFactors: 'WebGL/3D shaders required, scroll-linked timeline complexity, custom SVG morphing, and cross-browser performance tuning.',
    inclusions: ['Custom micro-animations and hover state physics', 'Smooth page transitions and route transition overlays', 'Scroll-driven reveals and kinetic typography sequences', 'GPU-accelerated WebGL or Three.js visual elements', 'Performance profiling maintaining smooth 60fps frame rates'],
    steps: [
      { step: '01', title: 'Motion Language', desc: 'Defining easing curves, spring physics, and interaction choreography.' },
      { step: '02', title: 'Micro-Interaction Build', desc: 'Coding magnetic buttons, cursor effects, and subtle tactile responses.' },
      { step: '03', title: 'Scroll Choreography', desc: 'Orchestrating scroll-triggered reveals and pinned viewport stages.' },
      { step: '04', title: 'GPU Optimization', desc: 'Offloading transforms to the GPU and enforcing reduced-motion accessibility.' },
    ],
  },
  {
    slug: 'digital-product-development',
    name: 'Digital Product Development',
    title: 'Digital Product Development & MVP Engineering | ENTROPY Studio',
    description: 'We partner with founders to shape concepts into production-ready digital products with scalable frontend architecture, API integration, and modular UI.',
    problemSolved: 'Inability to ship MVPs quickly, clunky amateur codebases requiring total rewrites, and disconnected design and engineering teams.',
    suitableFor: 'Early-stage founders validating new software ideas, established businesses digitizing operational workflows, and product teams launching new web tools.',
    pricingFactors: 'Feature complexity, database schema scope, user authorization tiers, and third-party API dependencies.',
    inclusions: ['Product requirement discovery and feature scoping', 'Scalable component-based architecture in modern TypeScript', 'API design, database modeling, and authentication flows', 'Comprehensive end-to-end user workflows and state handling', 'Production deployment with security headers and database backups'],
    steps: [
      { step: '01', title: 'Scope Definition', desc: 'Filtering product backlog down to core customer value drivers.' },
      { step: '02', title: 'System Architecture', desc: 'Designing database models, API schemas, and component hierarchies.' },
      { step: '03', title: 'Agile Sprints', desc: 'Building authenticated workflows, responsive views, and state flows.' },
      { step: '04', title: 'Testing & Release', desc: 'Conducting security audits, regression tests, and deploying to production.' },
    ],
  },
];

const PROJECTS = [
  { id: 'pulse', name: 'PULSE', category: 'UI/UX Design · Health Tech', classification: 'UI/UX Case Study', url: '/services/ui-ux-design' },
  { id: 'redesign-it', name: 'REDESIGN IT', category: 'UI/UX Design · Spatial App', classification: 'UI/UX Case Study', url: '/services/ui-ux-design' },
  { id: 'glitch', name: 'GLITCH', category: 'Fashion / E-Commerce', classification: 'Demonstration Platform', url: 'https://glitchcolhing.netlify.app/' },
  { id: 'beyond-growth', name: 'BEYOND GROWTH', category: 'Healthcare / Executive Coaching', classification: 'Demonstration Platform', url: 'https://beyondgrowth.netlify.app/' },
  { id: 'lumina', name: 'LUMINA', category: 'SaaS / Agency Portal', classification: 'Demonstration Platform', url: 'https://luminawebagencie.netlify.app/' },
  { id: 'journey-ai', name: 'JOURNEY AI', category: 'SaaS / AI Workflow', classification: 'Demonstration Platform', url: 'https://journeywithai.netlify.app/' },
  { id: 'snow-luxury', name: 'SNOW LUXURY', category: 'E-Commerce / Haute Horlogerie', classification: 'Demonstration Platform', url: 'https://snowluxury.netlify.app/' },
  { id: 'builderaura', name: 'BUILDERAURA', category: 'SaaS / Construction Architecture', classification: 'Demonstration Platform', url: 'https://buidleraura.netlify.app/' },
  { id: 'voltixaura', name: 'VOLTIXAURA', category: 'SaaS / Energy Telemetry', classification: 'Demonstration Platform', url: 'https://voltixaura.netlify.app/' },
  { id: 'travel-japan-escape', name: 'TRAVEL JAPAN ESCAPE', category: 'Editorial / Travel Journal', classification: 'Demonstration Platform', url: 'https://traveljapanescape.netlify.app/' },
  { id: 'quiet-shelf', name: 'QUIET SHELF', category: 'E-Commerce / Book Publisher', classification: 'Demonstration Platform', url: 'https://quiteshelf.netlify.app/' },
  { id: 'hiroshi-samurai', name: 'HIROSHI / SAMURAI', category: 'Creative / Archival Metallurgy', classification: 'Demonstration Platform', url: 'https://hiroshi-samurai.netlify.app/' },
  { id: 'gujarat-manpower', name: 'GUJARAT MANPOWER', category: 'Corporate / Industrial Staffing', classification: 'Client Work', url: 'https://gujaratmanpowerservices.com/' },
  { id: 'bites-bombay', name: 'BITES BOMBAY SANDWICH', category: 'E-Commerce / Culinary', classification: 'Client Work', url: 'https://bitesbombaysandwich.in/' },
  { id: 'fortune-makers', name: 'FORTUNEMAKERS', category: 'Corporate / Wealth Advisory', classification: 'Demonstration Platform', url: 'https://fortunemakeres.netlify.app/' },
  { id: 'paws-purrs', name: 'PAWS & PURRS', category: 'E-Commerce / Veterinary Nutrition', classification: 'Demonstration Platform', url: 'https://pawspurs.netlify.app/' },
  { id: 'atelier-kitchen', name: 'ATELIER KITCHENS', category: 'Corporate / Architectural Cabinetry', classification: 'Demonstration Platform', url: 'https://atelierkithcens.netlify.app/' },
];

function generateNavigationHtml() {
  return `
    <header style="padding: 28px 24px; text-align: center; border-bottom: 1px solid #1A1A24;">
      <nav aria-label="Main Navigation">
        <a href="/" style="color: #FFFFFF; font-weight: 600; text-decoration: none; margin: 0 14px; font-family: sans-serif;">Home</a>
        <a href="/about-us" style="color: #A1A1A6; text-decoration: none; margin: 0 14px; font-family: sans-serif;">About Us</a>
        <a href="/services" style="color: #A1A1A6; text-decoration: none; margin: 0 14px; font-family: sans-serif;">Services</a>
        <a href="/works" style="color: #A1A1A6; text-decoration: none; margin: 0 14px; font-family: sans-serif;">Works</a>
        <a href="/contact" style="color: #A1A1A6; text-decoration: none; margin: 0 14px; font-family: sans-serif;">Contact</a>
      </nav>
    </header>
  `;
}

function generateFooterHtml() {
  return `
    <footer style="margin-top: 56px; padding-top: 32px; border-top: 1px solid #1A1A24; color: #71717A; font-family: monospace; font-size: 13px; text-align: center;">
      <p>ENTROPY — Brand × Design × Technology | Vadodara, Gujarat, India (390007)</p>
      <p>Direct Inquiries: <a href="mailto:entropy.helpdesk@gmail.com" style="color: #BFD7F2;">entropy.helpdesk@gmail.com</a> | Phone: <a href="tel:+919558433430" style="color: #BFD7F2;">+91 9558433430</a></p>
      <p><a href="/contact" style="color: #38BDF8; text-decoration: none; font-weight: 600;">Start a Project Consultation →</a></p>
    </footer>
  `;
}

function buildHtmlForRoute({ routePath, title, description, canonicalUrl, pageType, jsonLd, bodyContent }) {
  let html = baseHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);

  // 2. Replace Description
  html = html.replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${description}" />`);

  // 3. Replace Canonical
  html = html.replace(/<link rel="canonical" href=".*?" \/>/s, `<link rel="canonical" href="${canonicalUrl}" />`);

  // 4. Replace OG Tags
  html = html.replace(/<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${canonicalUrl}" />`);

  // 5. Replace Twitter Tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${description}" />`);

  // 6. Replace Pre-rendered JSON-LD
  const jsonLdString = JSON.stringify(jsonLd, null, 2);
  html = html.replace(
    /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="entropy-initial-schema">\n${jsonLdString}\n    </script>`
  );

  // 7. Replace Semantic Fallback inside #root
  const fullRootHtml = `
    <div id="root" style="background-color: #000000; min-height: 100vh;">
      ${generateNavigationHtml()}
      <main style="max-width: 960px; margin: 0 auto; padding: 48px 24px; font-family: sans-serif; color: #F4F4F2;">
        ${bodyContent}
      </main>
      ${generateFooterHtml()}
    </div>
  `;

  const rootStart = html.indexOf('<div id="root"');
  const bodyEnd = html.indexOf('</body>');
  if (rootStart !== -1 && bodyEnd !== -1) {
    html = html.substring(0, rootStart) + fullRootHtml.trim() + '\n\n  ' + html.substring(bodyEnd);
  }

  return html;
}

// ------------------------------------------------------------------------------
// Route Generation Logic
// ------------------------------------------------------------------------------

const routeJobs = [];

// 1. /about-us
routeJobs.push({
  dir: path.resolve(distDir, 'about-us'),
  routePath: '/about-us',
  title: 'About Us — Ethos & Principles | ENTROPY Studio',
  description: "Learn about ENTROPY's multidisciplinary ethos. We combine strategic clarity, visual precision, and modern frontend engineering to create purposeful digital products.",
  canonicalUrl: `${SITE_URL}/about-us`,
  pageType: 'AboutPage',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about-us#aboutpage`,
    url: `${SITE_URL}/about-us`,
    name: 'About Us — Ethos & Principles | ENTROPY Studio',
    description: "Learn about ENTROPY's multidisciplinary ethos.",
    isPartOf: { '@id': `${SITE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'About Us', item: `${SITE_URL}/about-us` },
      ],
    },
  },
  bodyContent: `
    <h1 style="font-size: 2.5rem; letter-spacing: -0.02em; margin-bottom: 16px; color: #FFFFFF;">
      About Us — Studio Ethos & Principles
    </h1>
    <p style="font-size: 1.15rem; color: #D1D1D6; line-height: 1.7; margin-bottom: 28px;">
      ENTROPY is an independent creative technology studio engineering brand identities, digital flagships, and custom software systems.
      We operate globally from Vadodara, Gujarat, collaborating with ambitious founders, emerging technology startups, and established enterprises.
    </p>
    <section style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 28px; margin-bottom: 32px;">
      <h2 style="font-size: 1.35rem; color: #FFFFFF; margin-top: 0; margin-bottom: 12px;">Our Disciplines</h2>
      <ul style="color: #A1A1A6; line-height: 1.8; padding-left: 20px;">
        <li><strong>Brand Identity:</strong> Distinctive visual ecosystems, adaptive logos, and typography tokens.</li>
        <li><strong>Digital Flagships:</strong> Custom websites and web applications engineered with clean code and sub-second load times.</li>
        <li><strong>UI/UX Systems:</strong> Research-backed design systems and interactive Figma prototypes.</li>
        <li><strong>Motion & Interaction:</strong> Purposeful 60fps micro-animations and spatial depth.</li>
      </ul>
    </section>
  `,
});

// 2. /services
routeJobs.push({
  dir: path.resolve(distDir, 'services'),
  routePath: '/services',
  title: 'Services & Capabilities — Brand, Design & Web Engineering | ENTROPY',
  description: "Explore ENTROPY's core capabilities across brand identity, UI/UX systems, custom website development, e-commerce, and motion interaction design.",
  canonicalUrl: `${SITE_URL}/services`,
  pageType: 'CollectionPage',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/services#services`,
    url: `${SITE_URL}/services`,
    name: 'Services & Capabilities | ENTROPY Studio',
    description: "Explore ENTROPY's core capabilities across brand identity, UI/UX systems, custom website development, e-commerce, and motion.",
    isPartOf: { '@id': `${SITE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      ],
    },
  },
  bodyContent: `
    <h1 style="font-size: 2.5rem; letter-spacing: -0.02em; margin-bottom: 16px; color: #FFFFFF;">
      Capabilities & Disciplines
    </h1>
    <p style="font-size: 1.15rem; color: #D1D1D6; line-height: 1.7; margin-bottom: 32px;">
      We partner with ambitious teams to deliver cohesive brand systems, custom websites, and production-ready digital products.
    </p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      ${SERVICES.map(
        (s) => `
        <div style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 22px;">
          <h2 style="font-size: 1.2rem; margin-top: 0; margin-bottom: 8px;">
            <a href="/services/${s.slug}" style="color: #38BDF8; text-decoration: none;">${s.name} →</a>
          </h2>
          <p style="color: #A1A1A6; font-size: 0.95rem; line-height: 1.6; margin: 0;">${s.description}</p>
        </div>
      `
      ).join('')}
    </div>
  `,
});

// 3. /works
routeJobs.push({
  dir: path.resolve(distDir, 'works'),
  routePath: '/works',
  title: 'Selected Work & Digital Case Studies | ENTROPY Studio',
  description: 'Explore flagship digital experiences, interactive web applications, e-commerce storefronts, and brand design systems engineered by ENTROPY.',
  canonicalUrl: `${SITE_URL}/works`,
  pageType: 'CollectionPage',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/works#works`,
    url: `${SITE_URL}/works`,
    name: 'Selected Work & Digital Case Studies | ENTROPY Studio',
    description: 'Explore 17 live production projects, client platforms, and interactive digital experiences.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Works', item: `${SITE_URL}/works` },
      ],
    },
  },
  bodyContent: `
    <h1 style="font-size: 2.5rem; letter-spacing: -0.02em; margin-bottom: 16px; color: #FFFFFF;">
      Selected Works — Digital Portfolio
    </h1>
    <p style="font-size: 1.15rem; color: #D1D1D6; line-height: 1.7; margin-bottom: 32px;">
      Explore 17 verified digital projects across e-commerce, enterprise portals, SaaS infrastructure, and UI/UX systems.
    </p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      ${PROJECTS.map(
        (p) => `
        <div style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="font-size: 1.15rem; margin: 0; color: #FFFFFF;">${p.name}</h2>
            <span style="font-size: 0.75rem; font-family: monospace; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); color: #A1A1A6; border: 1px solid #27272A;">${p.classification}</span>
          </div>
          <p style="color: #8E8E93; font-size: 0.85rem; margin-bottom: 14px;">${p.category}</p>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" style="color: #38BDF8; font-size: 0.9rem; text-decoration: none;">View Project ↗</a>
        </div>
      `
      ).join('')}
    </div>
  `,
});

// 4. /contact
routeJobs.push({
  dir: path.resolve(distDir, 'contact'),
  routePath: '/contact',
  title: 'Start a Project — Contact ENTROPY Studio',
  description: "Tell us what you're building. Connect directly with ENTROPY to discuss your brand identity, website redesign, or digital product requirements.",
  canonicalUrl: `${SITE_URL}/contact`,
  pageType: 'ContactPage',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#contactpage`,
    url: `${SITE_URL}/contact`,
    name: 'Start a Project — Contact ENTROPY Studio',
    description: 'Direct communication with ENTROPY principals.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
      ],
    },
  },
  bodyContent: `
    <h1 style="font-size: 2.5rem; letter-spacing: -0.02em; margin-bottom: 16px; color: #FFFFFF;">
      Start Your Project
    </h1>
    <p style="font-size: 1.15rem; color: #D1D1D6; line-height: 1.7; margin-bottom: 32px;">
      Connect directly with ENTROPY principals. We collaborate across time zones with transparent scoping, prompt communication, and technical rigor.
    </p>
    <div style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 28px; margin-bottom: 32px;">
      <h2 style="font-size: 1.35rem; color: #FFFFFF; margin-top: 0; margin-bottom: 16px;">Direct Studio Contacts</h2>
      <p style="margin-bottom: 10px;"><strong>Official Email:</strong> <a href="mailto:entropy.helpdesk@gmail.com" style="color: #38BDF8;">entropy.helpdesk@gmail.com</a></p>
      <p style="margin-bottom: 10px;"><strong>Phone / WhatsApp:</strong> <a href="tel:+919558433430" style="color: #38BDF8;">+91 9558433430</a></p>
      <p style="margin-bottom: 10px;"><strong>Location:</strong> Vadodara, Gujarat, India (390007)</p>
      <p style="margin-bottom: 0;"><strong>Official Instagram:</strong> <a href="https://instagram.com/entropy.gen" style="color: #38BDF8;" target="_blank" rel="noopener noreferrer">@entropy.gen</a></p>
    </div>
  `,
});

// 5-14. Dedicated Service Detail Pages
for (const s of SERVICES) {
  routeJobs.push({
    dir: path.resolve(distDir, 'services', s.slug),
    routePath: `/services/${s.slug}`,
    title: s.title,
    description: s.description,
    canonicalUrl: `${SITE_URL}/services/${s.slug}`,
    pageType: 'WebPage',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/services/${s.slug}#service`,
      url: `${SITE_URL}/services/${s.slug}`,
      name: s.name,
      description: s.description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: [
        { '@type': 'Country', name: 'India' },
        { '@type': 'AdministrativeArea', name: 'Worldwide' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${s.name} Deliverables`,
        itemListElement: s.inclusions.map((inc) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: inc },
        })),
      },
    },
    bodyContent: `
      <div style="font-size: 0.85rem; font-family: monospace; color: #38BDF8; margin-bottom: 8px;">
        <a href="/services" style="color: #A1A1A6; text-decoration: none;">Services</a> / ${s.name}
      </div>
      <h1 style="font-size: 2.5rem; letter-spacing: -0.02em; margin-bottom: 16px; color: #FFFFFF;">
        ${s.name}
      </h1>
      <p style="font-size: 1.15rem; color: #D1D1D6; line-height: 1.7; margin-bottom: 32px;">
        ${s.description}
      </p>

      <section style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.25rem; color: #FFFFFF; margin-top: 0; margin-bottom: 10px;">Problems Addressed</h2>
        <p style="color: #A1A1A6; line-height: 1.7; margin: 0;">${s.problemSolved}</p>
      </section>

      <section style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.25rem; color: #FFFFFF; margin-top: 0; margin-bottom: 10px;">Who It's Suitable For</h2>
        <p style="color: #A1A1A6; line-height: 1.7; margin: 0;">${s.suitableFor}</p>
      </section>

      <section style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.25rem; color: #FFFFFF; margin-top: 0; margin-bottom: 14px;">Our Delivery Process</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          ${s.steps
            .map(
              (st) => `
            <div style="border-left: 2px solid #38BDF8; padding-left: 14px;">
              <div style="font-family: monospace; font-size: 0.8rem; color: #38BDF8;">STEP ${st.step}</div>
              <h3 style="font-size: 1rem; color: #FFFFFF; margin: 4px 0 6px 0;">${st.title}</h3>
              <p style="font-size: 0.85rem; color: #A1A1A6; line-height: 1.5; margin: 0;">${st.desc}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section style="background: #0A0A0E; border: 1px solid #1A1A24; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h2 style="font-size: 1.25rem; color: #FFFFFF; margin-top: 0; margin-bottom: 10px;">Key Deliverables</h2>
        <ul style="color: #A1A1A6; line-height: 1.8; padding-left: 20px; margin: 0;">
          ${s.inclusions.map((inc) => `<li>${inc}</li>`).join('')}
        </ul>
      </section>

      <div style="text-align: center; margin-top: 40px;">
        <a href="/contact" style="display: inline-block; padding: 12px 28px; background: #FFFFFF; color: #000000; font-weight: 600; text-decoration: none; border-radius: 9999px;">
          Enquire About ${s.name} →
        </a>
      </div>
    `,
  });
}

// Execute static file writes
console.log(`🚀 [Prerender Engine] Generating route-specific HTML files in ${distDir}...`);

for (const job of routeJobs) {
  if (!fs.existsSync(job.dir)) {
    fs.mkdirSync(job.dir, { recursive: true });
  }

  const outputHtml = buildHtmlForRoute(job);
  const targetFile = path.resolve(job.dir, 'index.html');
  fs.writeFileSync(targetFile, outputHtml, 'utf8');
  console.log(`  ✓ Prerendered ${job.routePath} -> ${path.relative(projectRoot, targetFile)}`);
}

console.log(`✨ [Prerender Engine] Completed prerendering for ${routeJobs.length} public routes.`);
