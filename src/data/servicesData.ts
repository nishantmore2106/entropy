export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  number: string;
  iconName:
    | 'Fingerprint'
    | 'Compass'
    | 'Shapes'
    | 'PanelsTopLeft'
    | 'Monitor'
    | 'Code2'
    | 'ShoppingCart'
    | 'MousePointer2'
    | 'AudioLines'
    | 'Layers3';
  shortDescription: string;
  description?: string;
  mainHeading: string;
  title?: string;
  introduction: string;
  problemSolved: string;
  suitableFor: string;
  pricingFactors: string;
  processSteps: ProcessStep[];
  longDescription: string[];
  inclusions: string[];
  deliverables?: string[];
  categoryLine?: string;
  relatedSlugs: string[];
  projectIds: string[];
  featuredProjectUrls?: string[];
}

export type ServiceArea = ServiceItem;

export const servicesData: ServiceItem[] = [
  {
    id: 'brand-identity',
    slug: 'brand-identity',
    name: 'Brand Identity',
    number: '01',
    iconName: 'Fingerprint',
    shortDescription: "A distinctive visual identity built around your brand's purpose.",
    mainHeading: 'Brand Identity',
    introduction:
      'We build cohesive visual identities that express who you are, what you stand for, and how your audience recognises you.',
    problemSolved:
      'Fragmented visuals, inconsistent customer touchpoints across web and print, and lack of a structured design system that prevents your brand from building market authority.',
    suitableFor:
      'Ambitious startups establishing their market presence, evolving companies outgrowing legacy branding, and enterprises seeking cohesive visual governance across digital platforms.',
    pricingFactors:
      'Scope of visual touchpoints (digital tokens, physical collateral, packaging), complexity of typographic licensing, and depth of brand guidelines.',
    processSteps: [
      {
        step: '01',
        title: 'Discovery & DNA',
        description: 'Unearthing company purpose, core values, audience expectations, and competitive differentiation.',
      },
      {
        step: '02',
        title: 'Visual Direction',
        description: 'Developing moodboards, conceptual directions, and typographic hierarchies tailored to your market.',
      },
      {
        step: '03',
        title: 'System Construction',
        description: 'Engineering the adaptive logo architecture, color tokens, graphic assets, and layout principles.',
      },
      {
        step: '04',
        title: 'Guidelines & Delivery',
        description: 'Producing developer-ready design tokens, asset libraries, and comprehensive digital brand guidelines.',
      },
    ],
    longDescription: [
      'A great brand identity is not merely an aesthetic layer; it is the structural translation of your vision into form, color, typography, and voice. We begin by unearthing the unique DNA of your organization, distilling core motivations and competitive positioning into a rigorous visual framework.',
      'From adaptive logo architectures and bespoke typographic hierarchies to digital-first design tokens and physical touchpoint guidelines, we construct comprehensive brand ecosystems designed to scale seamlessly across global digital platforms and physical media.',
      'Our deliverables ensure every designer, engineer, and content creator on your team has the exact tools, assets, and rules needed to present an unwavering, high-fidelity brand experience at every encounter.',
    ],
    inclusions: [
      'Logo system and variations',
      'Color palette and typography',
      'Visual identity guidelines',
      'Supporting graphic elements',
      'Brand mockups and applications',
    ],
    relatedSlugs: ['brand-strategy', 'logo-design', 'website-design'],
    projectIds: ['builderaura', 'voltixaura', 'hiroshi-samurai'],
    featuredProjectUrls: ['https://buidleraura.netlify.app/', 'https://voltixaura.netlify.app/'],
  },
  {
    id: 'brand-strategy',
    slug: 'brand-strategy',
    name: 'Brand Strategy',
    number: '02',
    iconName: 'Compass',
    shortDescription: 'Strategic foundations for a clear and consistent brand.',
    mainHeading: 'Brand Strategy',
    introduction:
      'We define the positioning, direction, and principles that help your brand communicate with clarity and purpose.',
    problemSolved:
      'Unclear value propositions, commoditized messaging that sounds like competitors, and internal misalignment on company direction that dilutes marketing effectiveness.',
    suitableFor:
      'Founders navigating competitive pivots, post-seed startups preparing for market expansion, and established firms realigning their offering with contemporary client expectations.',
    pricingFactors:
      'Market research depth, stakeholder interviews required, competitive landscape complexity, and narrative workshops.',
    processSteps: [
      {
        step: '01',
        title: 'Diagnostic Audit',
        description: 'Analyzing current brand assets, customer feedback, and competitive positioning gaps.',
      },
      {
        step: '02',
        title: 'Audience Insight',
        description: 'Mapping key decision-maker personas, emotional drivers, and empirical friction points.',
      },
      {
        step: '03',
        title: 'Positioning Architecture',
        description: 'Crafting defensible value pillars, market territory definitions, and key differentiators.',
      },
      {
        step: '04',
        title: 'Messaging Playbook',
        description: 'Delivering tone-of-voice frameworks, core pitch statements, and communication guidelines.',
      },
    ],
    longDescription: [
      'Before a single line is drawn or line of code written, clarity must be established. Our strategy process unites executive vision with rigorous market and competitor diagnostics to define where your brand can credibly and defensibly lead.',
      'We craft concise strategic pillars, value propositions, and communicative voice guidelines that cut through industry noise. By aligning internal conviction with genuine audience expectations, we eliminate ambiguity and create a confident springboard for creative execution.',
      'The outcome is a focused strategic compass that guides design systems, product roadmaps, and marketing narratives with persistent intent.',
    ],
    inclusions: [
      'Brand discovery and positioning',
      'Audience and competitor diagnostics',
      'Core value proposition framework',
      'Tone of voice and messaging direction',
      'Strategic creative brief for design execution',
    ],
    relatedSlugs: ['brand-identity', 'ui-ux-design', 'digital-product-development'],
    projectIds: ['beyond-growth', 'quiet-shelf'],
    featuredProjectUrls: ['https://beyondgrowth.netlify.app/'],
  },
  {
    id: 'logo-design',
    slug: 'logo-design',
    name: 'Logo Design',
    number: '03',
    iconName: 'Shapes',
    shortDescription: 'Purposeful symbols and wordmarks with a clear visual idea.',
    mainHeading: 'Logo Design',
    introduction:
      "We create memorable logo systems designed to communicate your brand's character with clarity, distinction, and intent.",
    problemSolved:
      'Dated or amateur symbols, illegibility at mobile and favicon scales, lack of trademark distinction, and marks that fail when rendered across dark interfaces or physical signage.',
    suitableFor:
      'New companies needing a definitive primary mark, established businesses modernizing an outdated emblem, and product teams launching independent sub-brands.',
    pricingFactors:
      'Number of initial conceptual routes, static vector vs. 3D kinetic animation requirements, and monochrome / sub-mark asset variation count.',
    processSteps: [
      {
        step: '01',
        title: 'Concept Exploration',
        description: 'Dozens of conceptual sketches exploring geometric balance, metaphor, and negative space.',
      },
      {
        step: '02',
        title: 'Precision Construction',
        description: 'Drafting selected concepts with mathematical grids, optical balance, and bespoke kerning.',
      },
      {
        step: '03',
        title: 'Multi-Context Testing',
        description: 'Stress-testing legibility from 16px micro-favicons to billboards and 3D kinetic environments.',
      },
      {
        step: '04',
        title: 'Asset Packaging',
        description: 'Delivering complete vector sets (SVG, EPS, PDF, PNG) with monochrome and reverse variations.',
      },
    ],
    longDescription: [
      'A symbol must carry immense semantic weight within milliseconds of recognition. Our logo design process explores dozens of conceptual routes, evaluating form, geometric balance, negative space, and typographic nuance to discover the singular mark that defines your organization.',
      'We pressure-test every symbol across micro-favicons, mobile app headers, physical architectural signage, and 3D kinetic renders to verify optimal legibility and balance across diverse contexts and scales.',
      'Each mark is delivered with comprehensive construction grids, monochrome variations, and precise safe-zone guidance.',
    ],
    inclusions: [
      'Primary symbol and bespoke wordmark',
      'Secondary lockups and stacked variations',
      'Monochrome, inverted, and icon versions',
      'Clear-space and minimum-scale rules',
      'Production-ready vector asset library',
    ],
    relatedSlugs: ['brand-identity', 'motion-interaction-design'],
    projectIds: ['hiroshi-samurai', 'glitch'],
    featuredProjectUrls: ['https://hiroshi-samurai.netlify.app/'],
  },
  {
    id: 'ui-ux-design',
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    number: '04',
    iconName: 'PanelsTopLeft',
    shortDescription: 'Intuitive interfaces designed around people and their needs.',
    mainHeading: 'UI/UX Design',
    introduction:
      'We turn complex ideas into clear digital experiences through thoughtful information architecture, user journeys, and interface design.',
    problemSolved:
      'High user drop-off during onboarding, confusing multi-step navigation, visual inconsistency across features, and interfaces that feel clinical rather than inviting.',
    suitableFor:
      'SaaS platforms, web applications, customer portals, and technology products that need to resolve intricate technical workflows into effortless consumer-grade usability.',
    pricingFactors:
      'Number of unique templates and application states, depth of design system component library, and interactive prototyping fidelity.',
    processSteps: [
      {
        step: '01',
        title: 'User Flow Mapping',
        description: 'Documenting decision trees, onboarding journeys, and core conversion pathways.',
      },
      {
        step: '02',
        title: 'Information Architecture',
        description: 'Structuring navigation hierarchies and content grouping to minimize cognitive load.',
      },
      {
        step: '03',
        title: 'Design System & UI',
        description: 'Crafting Figma component libraries with atomic design tokens, light/dark themes, and auto-layouts.',
      },
      {
        step: '04',
        title: 'Clickable Prototyping',
        description: 'Validating motion ergonomics, micro-interactions, and developer handoff specs.',
      },
    ],
    longDescription: [
      'Modern digital interfaces must resolve intricate technical capabilities into intuitive, frictionless user interactions. We map user psychological mental models, architect clear hierarchical navigation, and eliminate friction points across critical user pathways.',
      'Our team crafts robust design systems utilizing atomic design principles, complete with comprehensive Figma component libraries, responsive auto-layouts, dark/light themes, and interactive micro-state specifications.',
      'Through iterative prototyping and design validation, we build digital products that feel effortless, inviting, and unmistakably refined.',
    ],
    inclusions: [
      'Comprehensive user flows and journeys',
      'Information architecture schematics',
      'Wireframes and spatial layouts',
      'High-fidelity interface screens in Figma',
      'Interactive clickable prototypes',
      'Atomic design system token library',
    ],
    relatedSlugs: ['digital-product-development', 'website-design', 'motion-interaction-design'],
    projectIds: ['journey-ai', 'lumina', 'quiet-shelf'],
    featuredProjectUrls: ['https://journeywithai.netlify.app/', 'https://luminawebagencie.netlify.app/'],
  },
  {
    id: 'website-design',
    slug: 'website-design',
    name: 'Website Design',
    number: '05',
    iconName: 'Monitor',
    shortDescription: 'Considered digital experiences with strong visual direction.',
    mainHeading: 'Website Design',
    introduction:
      'We design websites that balance distinctive visual expression with clear structure, purposeful interactions, and responsive usability.',
    problemSolved:
      'Bland template websites that fail to reflect the premium quality of your real-world offering, awkward mobile layouts, and low engagement from high-value prospects.',
    suitableFor:
      'Design-led studios, technology firms, luxury brands, corporate enterprises, and founders who understand that a website is their primary global storefront.',
    pricingFactors:
      'Number of custom page layouts, custom 3D or kinetic animation art direction, and depth of responsive breakpoints.',
    processSteps: [
      {
        step: '01',
        title: 'Creative Art Direction',
        description: 'Establishing typography, color dynamics, spatial rhythm, and bespoke composition styles.',
      },
      {
        step: '02',
        title: 'Sitemap & Wireframes',
        description: 'Structuring narrative hierarchy, section pacing, and key call-to-action anchor points.',
      },
      {
        step: '03',
        title: 'High-Fidelity Layouts',
        description: 'Designing desktop, tablet, and mobile viewports with obsessive attention to typographic detail.',
      },
      {
        step: '04',
        title: 'Interactive Transition Specs',
        description: 'Detailing hover states, page transition wipes, and developer-ready CSS/Figma tokens.',
      },
    ],
    longDescription: [
      'In a landscape saturated with homogenous web templates, an exceptional website stands apart through bespoke art direction, dimensional depth, and cinematic composition. We design digital flagships that captivate visitors from the first millisecond.',
      'Every viewport breakpoint is treated with equal reverence, ensuring typography, layout geometry, spatial rhythm, and visual hierarchy retain their grace across smartphones, tablets, and ultrawide displays.',
      'Designs are delivered developer-ready with detailed interactive transition states, responsive layout rules, and production-tested design tokens.',
    ],
    inclusions: [
      'Bespoke visual art direction',
      'Sitemap and content narrative hierarchy',
      'Mobile, tablet, and desktop viewport layouts',
      'Interaction and transition specifications',
      'Design tokens and production asset export',
      'Developer handoff documentation',
    ],
    relatedSlugs: ['website-development', 'landing-pages', 'motion-interaction-design'],
    projectIds: ['snow-luxury', 'lumina', 'travel-japan-escape'],
    featuredProjectUrls: ['https://snowluxury.netlify.app/', 'https://quiteshelf.netlify.app/'],
  },
  {
    id: 'website-development',
    slug: 'website-development',
    name: 'Website Development',
    number: '06',
    iconName: 'Code2',
    shortDescription: 'Fast, responsive websites built with care and precision.',
    mainHeading: 'Website Development',
    introduction:
      'We transform approved designs into reliable, responsive websites using appropriate modern technologies and maintainable implementation practices.',
    problemSolved:
      'Slow load speeds (failing Core Web Vitals), brittle plugin dependencies, poor mobile touch ergonomics, and codebases that are difficult for internal teams to maintain.',
    suitableFor:
      'Companies needing high-speed digital flagships, web applications built on modern frameworks, and marketing teams demanding sub-second load times.',
    pricingFactors:
      'Total page count, custom WebGL / 3D shader requirements, CMS backend integration complexity, and custom API integrations.',
    processSteps: [
      {
        step: '01',
        title: 'Architecture Setup',
        description: 'Configuring lightweight bundlers (Vite), semantic HTML templates, and component architectures.',
      },
      {
        step: '02',
        title: 'Component Engineering',
        description: 'Building modular, responsive UI components with clean Tailwind CSS and modern TypeScript.',
      },
      {
        step: '03',
        title: 'Motion & WebGL Tuning',
        description: 'Integrating fluid 60fps animations while honoring prefers-reduced-motion and battery efficiency.',
      },
      {
        step: '04',
        title: 'SEO & Performance Audit',
        description: 'Validating semantic heading hierarchy, schema markup, sub-second LCP, and zero CLS layout shifts.',
      },
    ],
    longDescription: [
      'Exceptional design demands equally peerless code. We engineer high-performance web applications using modern web standards, lightweight component architectures, and responsive layouts that load with blistering speed.',
      'Our engineering approach emphasizes semantic HTML, accessible ARIA attributes, pristine asset optimization, and clean WebGL/Canvas shader integration to achieve fluid 60fps animations without sacrificing battery life or mobile responsiveness.',
      'Every project includes technical SEO foundations, comprehensive cross-browser validation, and clean, modular codebases built for effortless long-term maintenance.',
    ],
    inclusions: [
      'Frontend engineering with React and TypeScript',
      'Lightweight styling and responsive layouts',
      'Sub-second performance optimization (LCP < 1.2s)',
      'Accessible semantic HTML structure',
      'Automated schema markup and technical SEO',
      'Cross-browser and multi-device QA testing',
    ],
    relatedSlugs: ['website-design', 'ecommerce-development', 'digital-product-development'],
    projectIds: ['lumina', 'travel-japan-escape', 'voltixaura'],
    featuredProjectUrls: ['https://luminawebagencie.netlify.app/', 'https://traveljapanescape.netlify.app/'],
  },
  {
    id: 'ecommerce-development',
    slug: 'ecommerce-development',
    name: 'E-commerce Development',
    number: '07',
    iconName: 'ShoppingCart',
    shortDescription: 'Digital storefronts designed for clear product discovery and purchasing.',
    mainHeading: 'E-commerce Development',
    introduction:
      'We create considered shopping experiences that connect product presentation, intuitive navigation, and practical purchasing flows.',
    problemSolved:
      'High shopping cart abandonment rates, slow mobile product catalogs, confusing checkout flows, and storefronts that fail to communicate product craft and trust.',
    suitableFor:
      'D2C brands, boutique apparel labels, curated product catalogs, and high-ticket commerce merchants looking for distinctive storefront differentiation.',
    pricingFactors:
      'Catalog size, product variant complexity, custom cart/checkout workflows, payment gateway integrations, and inventory synchronization.',
    processSteps: [
      {
        step: '01',
        title: 'Catalog Architecture',
        description: 'Organizing product taxonomies, filtering schemas, and intuitive search pathways.',
      },
      {
        step: '02',
        title: 'Storefront Experience UI',
        description: 'Designing high-resolution product showcases, editorial lookbooks, and frictionless cart drawers.',
      },
      {
        step: '03',
        title: 'Engineering & Integration',
        description: 'Developing fast, responsive storefronts with secure payment gateway APIs and inventory logic.',
      },
      {
        step: '04',
        title: 'Conversion Optimization',
        description: 'Optimizing checkout velocity, mobile touch payment options, and automated order confirmations.',
      },
    ],
    longDescription: [
      'Digital commerce should feel like entering an impeccably curated flagship atelier. We design and build online stores that emphasize high-resolution product storytelling, dynamic collection filtering, and seamless discovery.',
      'From frictionless cart drawers and transparent inventory previews to checkout optimization and secure payment gateway integrations, every touchpoint is engineered to foster customer confidence and minimize drop-off.',
      'Storefronts are built with lightning-fast load times, comprehensive schema markup for search engines, and intuitive administrative workflows for effortless catalog management.',
    ],
    inclusions: [
      'Custom storefront design and development',
      'Product catalog and dynamic collection filtering',
      'Slide-over cart drawer and streamlined checkout',
      'Secure payment gateway API integration',
      'Mobile-first touch shopping ergonomics',
      'Product structured data for Google shopping results',
    ],
    relatedSlugs: ['website-development', 'ui-ux-design', 'landing-pages'],
    projectIds: ['snow-luxury', 'glitch'],
    featuredProjectUrls: ['https://snowluxury.netlify.app/', 'https://glitchcolhing.netlify.app/'],
  },
  {
    id: 'landing-pages',
    slug: 'landing-pages',
    name: 'Landing Pages',
    number: '08',
    iconName: 'MousePointer2',
    shortDescription: 'Focused pages built around one clear message and action.',
    mainHeading: 'Landing Pages',
    introduction:
      'We create focused landing pages that communicate value quickly, guide attention, and support a clearly defined campaign or business objective.',
    problemSolved:
      'Low conversion rates from advertising traffic, cluttered pages that confuse prospective customers, and slow mobile load times that cause costly bounce rates.',
    suitableFor:
      'Growth teams running paid marketing campaigns, startups launching new digital products, and businesses driving signups for conferences or waitlists.',
    pricingFactors:
      'Page length, number of custom interactive components (calculators, pricing toggles, modals), and analytics integration requirements.',
    processSteps: [
      {
        step: '01',
        title: 'Value Proposition Distillation',
        description: 'Defining the singular core message, audience problem, and compelling call-to-action.',
      },
      {
        step: '02',
        title: 'Narrative Wireframing',
        description: 'Structuring social proof, capability highlights, and objection-handling FAQs in optimal order.',
      },
      {
        step: '03',
        title: 'High-Impact Art Direction',
        description: 'Designing bold typography, visual demonstrations, and responsive conversion containers.',
      },
      {
        step: '04',
        title: 'Performance Launch',
        description: 'Building ultra-fast responsive code with analytics event tracking and instant lead capture.',
      },
    ],
    longDescription: [
      'A landing page has one singular mission: to capture attention, communicate value with immediate resonance, and guide the visitor toward a definitive decision. We build bespoke campaign destinations that achieve that mission with quiet confidence.',
      'By choreographing visual hierarchy, punchy narrative pacing, targeted social proof, and strategically placed calls-to-action, we create engaging narrative journeys that keep visitors focused on what matters most.',
      'Each page is optimized for rapid load times, mobile touch ergonomics, and comprehensive analytics tracking to give your growth team clear behavioral visibility.',
    ],
    inclusions: [
      'Conversion-focused narrative architecture',
      'High-impact visual art direction and typography',
      'Responsive layouts tested across mobile breakpoints',
      'Interactive form and enquiry lead capture',
      'Sub-second mobile page load speed',
      'Privacy-conscious conversion analytics setup',
    ],
    relatedSlugs: ['website-design', 'website-development', 'motion-interaction-design'],
    projectIds: ['glitch', 'builderaura'],
    featuredProjectUrls: ['https://glitchcolhing.netlify.app/', 'https://buidleraura.netlify.app/'],
  },
  {
    id: 'motion-interaction-design',
    slug: 'motion-interaction-design',
    name: 'Motion & Interaction Design',
    number: '09',
    iconName: 'AudioLines',
    shortDescription: 'Thoughtful movement that gives digital experiences character.',
    mainHeading: 'Motion & Interaction Design',
    introduction:
      'We use purposeful motion, transitions, and interaction details to make interfaces feel responsive, expressive, and connected.',
    problemSolved:
      'Rigid, lifeless websites that fail to engage modern audiences, abrupt page transitions that disorient visitors, and heavy animation that causes lag and drains device battery.',
    suitableFor:
      'Digital flagship websites, luxury and creative portfolios, tech product launches, and interactive web experiences aiming for international awards and recognition.',
    pricingFactors:
      'Complexity of custom physics/shaders, WebGL canvas integration, 3D model choreography, and motion guideline depth.',
    processSteps: [
      {
        step: '01',
        title: 'Motion Choreography',
        description: 'Storyboarding kinetic timing curves, cursor physics, and spatial camera transforms.',
      },
      {
        step: '02',
        title: 'Interactive Prototyping',
        description: 'Testing spring stiffness, damping ratios, and scroll-linked reveals.',
      },
      {
        step: '03',
        title: '60fps Code Engineering',
        description: 'Implementing GPU-accelerated transforms via Framer Motion, GSAP, and Three.js.',
      },
      {
        step: '04',
        title: 'Accessibility Tuning',
        description: 'Implementing strict prefers-reduced-motion fallbacks for accessible, inclusive motion.',
      },
    ],
    longDescription: [
      'Motion is the emotional pulse of modern digital experiences. When executed with precision, animation transforms a static web interface into a living, responsive environment that rewards curiosity and communicates state changes intuitively.',
      'We craft tailored physics-based springs, magnetic cursor dynamics, scroll-linked spatial camera transforms, and bespoke WebGL particle systems that elevate user engagement without adding cognitive fatigue or performance lag.',
      'All choreographies respect user preferences like `prefers-reduced-motion` and are tuned for silky 60fps execution across diverse devices and hardware profiles.',
    ],
    inclusions: [
      'Choreographed page transition wipes',
      'Scroll-linked camera and parallax dynamics',
      'Magnetic cursor micro-interactions',
      'Interactive 3D model WebGL presentations',
      'Hardware-accelerated 60fps performance',
      'Reduced-motion accessibility compliance',
    ],
    relatedSlugs: ['ui-ux-design', 'website-design', 'digital-product-development'],
    projectIds: ['travel-japan-escape', 'hiroshi-samurai', 'lumina'],
    featuredProjectUrls: ['https://traveljapanescape.netlify.app/', 'https://hiroshi-samurai.netlify.app/'],
  },
  {
    id: 'digital-product-development',
    slug: 'digital-product-development',
    name: 'Digital Product Development',
    number: '10',
    iconName: 'Layers3',
    shortDescription: 'Digital products shaped from initial concept to implementation.',
    mainHeading: 'Digital Product Development',
    introduction:
      'We help turn product ideas into structured digital experiences by connecting product thinking, interface design, and technical implementation.',
    problemSolved:
      'The disconnect between design concepts and production code, architectural technical debt, and slow product development cycles that delay market entry.',
    suitableFor:
      'Founders building initial MVPs, technology scale-ups expanding their product suites, and businesses modernizing legacy operational software into modern web applications.',
    pricingFactors:
      'Feature scope, backend API integration complexity, real-time data requirements, and security/compliance standards.',
    processSteps: [
      {
        step: '01',
        title: 'Product Scope & MVP Strategy',
        description: 'Defining core feature boundaries, technical constraints, and rapid go-to-market milestones.',
      },
      {
        step: '02',
        title: 'System Architecture & UI',
        description: 'Engineering the design system, state synchronization model, and component specifications.',
      },
      {
        step: '03',
        title: 'Frontend & API Engineering',
        description: 'Developing high-speed, type-safe web applications with clean TypeScript and modular APIs.',
      },
      {
        step: '04',
        title: 'Security, QA & Release',
        description: 'Conducting automated security audits, input validation testing, and deployment to cloud infrastructure.',
      },
    ],
    longDescription: [
      'Bringing a sophisticated digital product to market requires an intimate marriage of strategic product architecture, human-centered UI design, and robust frontend engineering. We partner with founders and enterprise innovators to take concepts from napkin sketches to production platforms.',
      'Our multidisciplinary team defines MVP scopes, validates user workflows, crafts comprehensive component libraries, and develops scalable web application frontends backed by modular API integrations.',
      'We focus on technical longevity, accessibility, state synchronization, and clean design handoffs to ensure your product has a solid foundation for exponential growth.',
    ],
    inclusions: [
      'MVP scope definition and technical roadmap',
      'User journey mapping and wireframing',
      'Interactive Figma design system',
      'Type-safe frontend application engineering',
      'Modular REST/API integration',
      'Automated security testing and deployment',
    ],
    relatedSlugs: ['ui-ux-design', 'website-development', 'brand-strategy'],
    projectIds: ['journey-ai', 'beyond-growth'],
    featuredProjectUrls: ['https://journeywithai.netlify.app/'],
  },
];

// Populate backward compatibility properties
servicesData.forEach((s) => {
  s.title = s.name;
  s.description = s.shortDescription;
  s.deliverables = s.inclusions;
  s.categoryLine = s.inclusions.join(' · ');
});

export const getServiceBySlug = (slug: string): ServiceItem | undefined => {
  const cleanSlug = slug.replace(/^\/services\/?/, '').replace(/\/$/, '');
  return servicesData.find((s) => s.slug === cleanSlug || s.id === cleanSlug);
};

export const getAllServices = (): ServiceItem[] => servicesData;
