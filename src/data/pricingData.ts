/**
 * ENTROPY — Central Pricing Configuration
 * Single source of truth for all pricing packages across the studio website.
 * 
 * Note on Rates:
 * - Approved Rates: Previously approved in studio pricing material (e.g. Complete Brand Identity ₹75,000, Complete Website Design ₹50,000).
 * - Draft Starting Rates: Proposed baseline rates for review and scope-dependent adjustments.
 */

export interface PricingPackage {
  id: string;
  categoryFilter: string;
  categoryLabel: string;
  name: string;
  pricePrefix: string;
  startingPrice: string;
  isApprovedRate: boolean;
  rateStatusNote?: string;
  description: string;
  inclusions: string[];
  recommendationLabel?: string;
  serviceSlug: string;
  serviceName: string;
}

export interface PricingFilterOption {
  id: string;
  label: string;
}

export const PRICING_FILTERS: PricingFilterOption[] = [
  { id: 'all', label: 'All Services' },
  { id: 'landing-pages', label: 'Landing Pages' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'custom-websites', label: 'Custom Websites' },
  { id: 'brand-identity', label: 'Brand Identity' },
  { id: 'brand-strategy', label: 'Brand Strategy' },
  { id: 'logo-design', label: 'Logo Design' },
  { id: 'ui-ux-design', label: 'UI/UX Design' },
  { id: 'website-design', label: 'Website Design' },
  { id: 'website-development', label: 'Website Development' },
];

export const pricingPackagesData: Record<string, PricingPackage[]> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // ALL SERVICES (Representative Overview)
  // ─────────────────────────────────────────────────────────────────────────────
  all: [
    {
      id: 'all-landing-page',
      categoryFilter: 'all',
      categoryLabel: 'Campaign / Web',
      name: 'Landing Page',
      pricePrefix: 'From',
      startingPrice: '₹15,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft starting rate subject to scope',
      description: 'A focused page designed around one message and one clear action.',
      inclusions: [
        'One responsive landing page',
        'Custom visual design & typography',
        'CTA and contact integration',
        'Essential micro-interactions',
        'Basic on-page SEO setup',
        'Mobile performance optimization',
      ],
      serviceSlug: 'landing-pages',
      serviceName: 'Landing Pages',
    },
    {
      id: 'all-ecommerce-store',
      categoryFilter: 'all',
      categoryLabel: 'Storefront / Commerce',
      name: 'E-commerce Store',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: true,
      rateStatusNote: 'Standard core starting rate',
      description: 'A considered online store built around product discovery and purchasing.',
      inclusions: [
        'Storefront and product pages',
        'Cart and checkout flow',
        'Product and collection structure',
        'Payment integration, subject to requirements',
        'Responsive layouts across viewports',
        'Store-management functionality where supported',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'ecommerce-development',
      serviceName: 'E-commerce Development',
    },
    {
      id: 'all-custom-website',
      categoryFilter: 'all',
      categoryLabel: 'Bespoke / Flagship',
      name: 'Custom Website',
      pricePrefix: 'From',
      startingPrice: '₹1,00,000+',
      isApprovedRate: false,
      rateStatusNote: 'Draft starting rate for bespoke builds',
      description: 'A tailored digital experience shaped around your project’s requirements.',
      inclusions: [
        'Discovery and scope definition',
        'Custom website architecture',
        'Tailored design and interactions',
        'Custom frontend & backend development',
        'Integrations based on scope',
        'Testing and performance refinement',
      ],
      serviceSlug: 'website-development',
      serviceName: 'Website Development',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // LANDING PAGES
  // ─────────────────────────────────────────────────────────────────────────────
  'landing-pages': [
    {
      id: 'lp-essential',
      categoryFilter: 'landing-pages',
      categoryLabel: 'Essential / Conversion',
      name: 'Essential Landing Page',
      pricePrefix: 'From',
      startingPrice: '₹15,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft starting rate',
      description: 'A high-conversion destination with clear message hierarchy and immediate impact.',
      inclusions: [
        'One responsive landing page',
        'Custom visual design & typography',
        'Lead capture form integration',
        'Mobile touch optimization',
        'Basic on-page SEO meta tags',
        'Fast delivery turnaround',
      ],
      serviceSlug: 'landing-pages',
      serviceName: 'Landing Pages',
    },
    {
      id: 'lp-interactive',
      categoryFilter: 'landing-pages',
      categoryLabel: 'Interactive / Brand',
      name: 'Interactive Campaign Page',
      pricePrefix: 'From',
      startingPrice: '₹28,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft proposed rate',
      description: 'Rich narrative storytelling with tailored micro-animations and engagement details.',
      inclusions: [
        'Multi-section campaign flow',
        'Motion & scroll-linked interactions',
        'Interactive FAQ & feature tabs',
        'Analytics & event tracking integration',
        'Conversion & speed optimization',
        'Social preview & share assets',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'landing-pages',
      serviceName: 'Landing Pages',
    },
    {
      id: 'lp-launch',
      categoryFilter: 'landing-pages',
      categoryLabel: 'Flagship / Spatial',
      name: 'Bespoke Product Launch',
      pricePrefix: 'From',
      startingPrice: '₹45,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft proposed rate',
      description: 'Cinematic flagship digital launch experience with 3D or WebGL visual accents.',
      inclusions: [
        'Custom 3D / WebGL shader integration',
        'Art-directed visual components',
        'CRM & webhook workflow integration',
        'Cross-device 60fps performance tuning',
        'Lighthouse 95+ score optimization',
        'Full source code & asset handoff',
      ],
      serviceSlug: 'landing-pages',
      serviceName: 'Landing Pages',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // E-COMMERCE
  // ─────────────────────────────────────────────────────────────────────────────
  ecommerce: [
    {
      id: 'ecom-starter',
      categoryFilter: 'ecommerce',
      categoryLabel: 'Boutique / Starter',
      name: 'Starter Storefront',
      pricePrefix: 'From',
      startingPrice: '₹35,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft proposed rate',
      description: 'Streamlined boutique shop designed for curated catalogs and swift launch.',
      inclusions: [
        'Up to 15 curated products',
        'Storefront & product detail pages',
        'Standard shopping cart drawer',
        'Payment gateway configuration',
        'Mobile-first checkout UX',
        'Inventory management basics',
      ],
      serviceSlug: 'ecommerce-development',
      serviceName: 'E-commerce Development',
    },
    {
      id: 'ecom-flagship',
      categoryFilter: 'ecommerce',
      categoryLabel: 'Brand / Flagship',
      name: 'Brand Flagship Store',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: true,
      rateStatusNote: 'Preserved core starting rate',
      description: 'A considered online store built around product discovery and purchasing.',
      inclusions: [
        'Storefront and product pages',
        'Cart and checkout flow',
        'Product and collection structure',
        'Payment integration, subject to requirements',
        'Responsive layouts across viewports',
        'Store-management functionality where supported',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'ecommerce-development',
      serviceName: 'E-commerce Development',
    },
    {
      id: 'ecom-custom',
      categoryFilter: 'ecommerce',
      categoryLabel: 'Advanced / Scaled',
      name: 'Custom Commerce Platform',
      pricePrefix: 'From',
      startingPrice: '₹95,000+',
      isApprovedRate: false,
      rateStatusNote: 'Draft starting rate',
      description: 'Advanced digital commerce system with bespoke workflows and integrations.',
      inclusions: [
        'Unlimited catalog architecture',
        'Advanced faceted filtering & search',
        'Custom cart & bundle logic',
        'Third-party ERP & inventory sync',
        'Automated transactional emails',
        'Global currency & multi-region support',
      ],
      serviceSlug: 'ecommerce-development',
      serviceName: 'E-commerce Development',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOM WEBSITES
  // ─────────────────────────────────────────────────────────────────────────────
  'custom-websites': [
    {
      id: 'cw-landing-page',
      categoryFilter: 'custom-websites',
      categoryLabel: 'Single Page / Campaign',
      name: 'Landing Page',
      pricePrefix: 'From',
      startingPrice: '₹15,000',
      isApprovedRate: false,
      rateStatusNote: 'Draft starting rate',
      description: 'A focused page designed around one message and one clear action.',
      inclusions: [
        'One responsive landing page',
        'Custom visual design & typography',
        'CTA and contact integration',
        'Essential micro-interactions',
        'Basic on-page SEO setup',
        'Fast delivery turnaround',
      ],
      serviceSlug: 'landing-pages',
      serviceName: 'Landing Pages',
    },
    {
      id: 'cw-ecommerce-store',
      categoryFilter: 'custom-websites',
      categoryLabel: 'Storefront / Commerce',
      name: 'E-commerce Store',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: true,
      rateStatusNote: 'Preserved core starting rate',
      description: 'A considered online store built around product discovery and purchasing.',
      inclusions: [
        'Storefront and product pages',
        'Cart and checkout flow',
        'Product and collection structure',
        'Payment integration, subject to requirements',
        'Responsive layouts across viewports',
        'Store-management functionality where supported',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'ecommerce-development',
      serviceName: 'E-commerce Development',
    },
    {
      id: 'cw-bespoke-platform',
      categoryFilter: 'custom-websites',
      categoryLabel: 'Bespoke / Platform',
      name: 'Custom Website',
      pricePrefix: 'From',
      startingPrice: '₹1,00,000+',
      isApprovedRate: false,
      rateStatusNote: 'Draft bespoke starting rate',
      description: 'A tailored digital experience shaped around your project’s requirements.',
      inclusions: [
        'Discovery and scope definition',
        'Custom website architecture',
        'Tailored design and interactions',
        'Custom frontend & backend development',
        'Integrations based on scope',
        'Testing and performance refinement',
      ],
      serviceSlug: 'website-development',
      serviceName: 'Website Development',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // BRAND IDENTITY
  // ─────────────────────────────────────────────────────────────────────────────
  'brand-identity': [
    {
      id: 'bi-essential',
      categoryFilter: 'brand-identity',
      categoryLabel: 'Core / Foundational',
      name: 'Essential Identity',
      pricePrefix: 'From',
      startingPrice: '₹25,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Essential visual assets to establish a unified and credible brand presence.',
      inclusions: [
        'Primary symbol & wordmark',
        'Color palette & typography scale',
        'Basic usage rules one-sheet',
        'Favicon & social profile marks',
        'Master vector asset deliverables',
      ],
      serviceSlug: 'brand-identity',
      serviceName: 'Brand Identity',
    },
    {
      id: 'bi-signature',
      categoryFilter: 'brand-identity',
      categoryLabel: 'Growing / Scaling',
      name: 'Signature Identity',
      pricePrefix: 'From',
      startingPrice: '₹45,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Multi-touchpoint identity ecosystem built to scale across digital and print.',
      inclusions: [
        'Full logo system & responsive lockups',
        'Typography hierarchy & design tokens',
        'Stationery & packaging concepts',
        'Social media design templates',
        'Comprehensive digital brand guidelines',
        'High-resolution presentation mockups',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'brand-identity',
      serviceName: 'Brand Identity',
    },
    {
      id: 'bi-complete',
      categoryFilter: 'brand-identity',
      categoryLabel: 'Studio Flagship Engagement',
      name: 'Complete Brand Identity',
      pricePrefix: 'From',
      startingPrice: '₹75,000',
      isApprovedRate: true,
      rateStatusNote: 'Preserved previously approved rate',
      description: 'Holistic brand architecture uniting identity, design tokens, and physical touchpoints.',
      inclusions: [
        'End-to-end brand identity architecture',
        'Sub-brand & product naming guidelines',
        'Extensive physical & packaging mockups',
        'Complete digital brand book (PDF & Figma)',
        'Design token handoff for engineering teams',
        'Studio consultation & creative direction',
      ],
      serviceSlug: 'brand-identity',
      serviceName: 'Brand Identity',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // BRAND STRATEGY
  // ─────────────────────────────────────────────────────────────────────────────
  'brand-strategy': [
    {
      id: 'bs-foundation',
      categoryFilter: 'brand-strategy',
      categoryLabel: 'Diagnostic / Core',
      name: 'Brand Foundation',
      pricePrefix: 'From',
      startingPrice: '₹15,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Discovery and core principles to define brand essence and clarity.',
      inclusions: [
        'Studio discovery interview session',
        'Core mission & value definition',
        'Target audience persona profiles',
        'Competitive landscape benchmark',
        'Foundational messaging document',
      ],
      serviceSlug: 'brand-strategy',
      serviceName: 'Brand Strategy',
    },
    {
      id: 'bs-positioning',
      categoryFilter: 'brand-strategy',
      categoryLabel: 'Market Differentiation',
      name: 'Brand Positioning',
      pricePrefix: 'From',
      startingPrice: '₹30,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Defensible market positioning with articulated value propositions and narrative.',
      inclusions: [
        'In-depth competitor diagnostics',
        'Differentiated value propositions',
        'Voice, tone & verbal identity guide',
        'Key messaging matrix per channel',
        'Strategic rollout roadmap',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'brand-strategy',
      serviceName: 'Brand Strategy',
    },
    {
      id: 'bs-comprehensive',
      categoryFilter: 'brand-strategy',
      categoryLabel: 'Executive / Strategic',
      name: 'Comprehensive Strategy',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Rigorous strategic framework uniting executive vision, product roadmap, and market expansion.',
      inclusions: [
        'Executive vision & roadmap alignment',
        'Market whitespace diagnostic',
        'Category creation positioning',
        'Comprehensive communicative playbook',
        'Customer journey messaging strategy',
        'Quarterly strategic alignment review',
      ],
      serviceSlug: 'brand-strategy',
      serviceName: 'Brand Strategy',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGO DESIGN
  // ─────────────────────────────────────────────────────────────────────────────
  'logo-design': [
    {
      id: 'ld-essential',
      categoryFilter: 'logo-design',
      categoryLabel: 'Single Mark / Core',
      name: 'Essential Logo',
      pricePrefix: 'From',
      startingPrice: '₹10,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'A clean, memorable mark designed with geometric precision and balance.',
      inclusions: [
        '2 distinct conceptual routes',
        'Selected mark geometric refinement',
        'Monochrome & inverse variations',
        'Export in all vector/web formats',
        'Basic safe-zone guidance',
      ],
      serviceSlug: 'logo-design',
      serviceName: 'Logo Design',
    },
    {
      id: 'ld-system',
      categoryFilter: 'logo-design',
      categoryLabel: 'Adaptive / Lockups',
      name: 'Logo System',
      pricePrefix: 'From',
      startingPrice: '₹20,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'A versatile symbol and wordmark architecture tailored for diverse touchpoints.',
      inclusions: [
        '3 exploratory conceptual routes',
        'Primary & secondary lockups',
        'Vertical, horizontal & icon versions',
        'Color pairings & clearspace rules',
        'Application mockups in real contexts',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'logo-design',
      serviceName: 'Logo Design',
    },
    {
      id: 'ld-suite',
      categoryFilter: 'logo-design',
      categoryLabel: 'Complete / Kinetic',
      name: 'Complete Logo Suite',
      pricePrefix: 'From',
      startingPrice: '₹35,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'A fully articulated trademark identity with grid construction and animated mark.',
      inclusions: [
        'Comprehensive exploratory routes',
        'Geometric construction blueprints',
        'Sub-mark & monogram extensions',
        'Kinetic / animated logo reveal (MP4/Lottie)',
        'Complete brand asset export kit',
        'Trademark safe-zone documentation',
      ],
      serviceSlug: 'logo-design',
      serviceName: 'Logo Design',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // UI/UX DESIGN
  // ─────────────────────────────────────────────────────────────────────────────
  'ui-ux-design': [
    {
      id: 'uiux-foundation',
      categoryFilter: 'ui-ux-design',
      categoryLabel: 'Wireframes / IA',
      name: 'UX Foundation',
      pricePrefix: 'From',
      startingPrice: '₹20,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Information architecture and wireframe flows resolving user journeys.',
      inclusions: [
        'User persona & journey mapping',
        'Information architecture sitemap',
        'Low-fidelity interactive wireframes',
        'Navigation hierarchy design',
        'UX friction point audit',
      ],
      serviceSlug: 'ui-ux-design',
      serviceName: 'UI/UX Design',
    },
    {
      id: 'uiux-standard',
      categoryFilter: 'ui-ux-design',
      categoryLabel: 'Interface / Prototype',
      name: 'UI/UX Design',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'High-fidelity interface design crafted around clarity and seamless usability.',
      inclusions: [
        'Full key screen visual designs',
        'Responsive desktop & mobile layouts',
        'Interactive clickable Figma prototype',
        'Design system foundation (components/tokens)',
        'Developer handoff specifications',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'ui-ux-design',
      serviceName: 'UI/UX Design',
    },
    {
      id: 'uiux-system',
      categoryFilter: 'ui-ux-design',
      categoryLabel: 'Product / System',
      name: 'Comprehensive Interface System',
      pricePrefix: 'From',
      startingPrice: '₹85,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'End-to-end product design system with micro-states and component libraries.',
      inclusions: [
        'Complete multi-platform application UI',
        'Atomic design component library',
        'Dark & light mode theme variables',
        'Complex micro-interaction specifications',
        'Interactive prototype for user testing',
        'Design token synchronization for code',
      ],
      serviceSlug: 'ui-ux-design',
      serviceName: 'UI/UX Design',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // WEBSITE DESIGN
  // ─────────────────────────────────────────────────────────────────────────────
  'website-design': [
    {
      id: 'wd-landing',
      categoryFilter: 'website-design',
      categoryLabel: 'Single Page Art Direction',
      name: 'Landing Page Design',
      pricePrefix: 'From',
      startingPrice: '₹15,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Focused campaign art direction and visual layout with strong visual hierarchy.',
      inclusions: [
        'Bespoke art direction & typography',
        'Responsive desktop & mobile designs',
        'Interactive state specifications',
        'Asset optimization & preparation',
        'Developer-ready Figma handoff file',
      ],
      serviceSlug: 'website-design',
      serviceName: 'Website Design',
    },
    {
      id: 'wd-business',
      categoryFilter: 'website-design',
      categoryLabel: 'Multi-Page / Brand',
      name: 'Business Website Design',
      pricePrefix: 'From',
      startingPrice: '₹30,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Considered multi-page web presence communicating your business with distinction.',
      inclusions: [
        'Up to 5 custom page designs',
        'Responsive smartphone & tablet states',
        'Interactive navigation & drawer UX',
        'Bespoke imagery & iconography direction',
        'Full Figma component system',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'website-design',
      serviceName: 'Website Design',
    },
    {
      id: 'wd-complete',
      categoryFilter: 'website-design',
      categoryLabel: 'Cinematic Flagship Design',
      name: 'Complete Website Design',
      pricePrefix: 'From',
      startingPrice: '₹50,000',
      isApprovedRate: true,
      rateStatusNote: 'Preserved previously approved rate',
      description: 'Cinematic flagship website design with editorial art direction and motion specs.',
      inclusions: [
        'Comprehensive multi-page architecture',
        'Cinematic editorial typography & rhythm',
        'Motion & scroll transition blueprints',
        '3D / spatial UI composition guidance',
        'Design token system & dev handoff',
        'Design review during implementation',
      ],
      serviceSlug: 'website-design',
      serviceName: 'Website Design',
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // WEBSITE DEVELOPMENT
  // ─────────────────────────────────────────────────────────────────────────────
  'website-development': [
    {
      id: 'wdev-frontend',
      categoryFilter: 'website-development',
      categoryLabel: 'Frontend Engineering',
      name: 'Frontend Implementation',
      pricePrefix: 'From',
      startingPrice: '₹20,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Transforming approved Figma designs into fast, semantic, and responsive code.',
      inclusions: [
        'Clean React / modern web codebase',
        'Pixel-accurate responsive implementation',
        'Accessible semantic HTML structure',
        'Cross-browser validation',
        'Fast load-time optimization',
      ],
      serviceSlug: 'website-development',
      serviceName: 'Website Development',
    },
    {
      id: 'wdev-business',
      categoryFilter: 'website-development',
      categoryLabel: 'Full-Stack / CMS',
      name: 'Business Website Build',
      pricePrefix: 'From',
      startingPrice: '₹40,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'Reliable full-stack website with CMS integration, forms, and interactive transitions.',
      inclusions: [
        'Multi-page frontend architecture',
        'Content management system integration',
        'Dynamic contact & inquiry workflows',
        'Smooth micro-animations & reveals',
        'Technical SEO foundation & schema',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'website-development',
      serviceName: 'Website Development',
    },
    {
      id: 'wdev-custom',
      categoryFilter: 'website-development',
      categoryLabel: 'High-Performance Flagship',
      name: 'Custom Website Development',
      pricePrefix: 'From',
      startingPrice: '₹75,000',
      isApprovedRate: false,
      rateStatusNote: 'Proposed starting rate',
      description: 'High-performance digital flagship with custom WebGL, shader, and API integrations.',
      inclusions: [
        'Custom WebGL / Canvas shader effects',
        'Complex scroll-linked interactions',
        'API & third-party integrations',
        'Advanced caching & asset pipeline',
        'Lighthouse 95+ score optimization',
        'Full deployment setup & documentation',
      ],
      recommendationLabel: 'Recommended',
      serviceSlug: 'website-development',
      serviceName: 'Website Development',
    },
  ],
};

export const getPricingPackagesByFilter = (filterId: string): PricingPackage[] => {
  return pricingPackagesData[filterId] || pricingPackagesData.all;
};
