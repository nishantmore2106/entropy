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
    longDescription: [
      'Before a single line is drawn or line of code written, clarity must be established. Our strategy process unites executive vision with rigorous market and competitor diagnostics to define where your brand can credibly and defensibly lead.',
      'We craft concise strategic pillars, value propositions, and communicative voice guidelines that cut through industry noise. By aligning internal conviction with genuine audience expectations, we eliminate ambiguity and create a confident springboard for creative execution.',
      'The outcome is a focused strategic compass that guides design systems, product roadmaps, and marketing narratives with persistent intent.',
    ],
    inclusions: [
      'Brand discovery',
      'Positioning and differentiation',
      'Audience and competitor research',
      'Brand messaging direction',
      'Creative direction',
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
    longDescription: [
      'A symbol must carry immense semantic weight within milliseconds of recognition. Our logo design process explores dozens of conceptual routes, evaluating form, geometric balance, negative space, and typographic nuance to discover the singular mark that defines your organization.',
      'We pressure-test every symbol across micro-favicons, mobile app headers, physical architectural signage, and 3D kinetic renders to guarantee flawless legibility and balance in any context or scale.',
      'Each mark is delivered with comprehensive construction grids, monochrome variations, and precise safe-zone guidance.',
    ],
    inclusions: [
      'Symbol and wordmark design',
      'Primary and secondary logo variations',
      'Monochrome versions',
      'Logo usage guidance',
      'Presentation mockups',
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
    longDescription: [
      'Modern digital interfaces must resolve intricate technical capabilities into intuitive, frictionless user interactions. We map user psychological mental models, architect clear hierarchical navigation, and eliminate friction points across critical user pathways.',
      'Our team crafts robust design systems utilizing atomic design principles, complete with comprehensive Figma component libraries, responsive auto-layouts, dark/light themes, and interactive micro-state specifications.',
      'Through iterative prototyping and design validation, we build digital products that feel effortless, inviting, and unmistakably refined.',
    ],
    inclusions: [
      'User flows',
      'Information architecture',
      'Wireframes',
      'High-fidelity interface design',
      'Interactive prototypes',
      'Responsive design systems',
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
    longDescription: [
      'In a landscape saturated with homogenous web templates, an exceptional website stands apart through bespoke art direction, dimensional depth, and cinematic composition. We design digital flagships that captivate visitors from the first millisecond.',
      'Every viewport breakpoint is treated with equal reverence, ensuring typography, layout geometry, spatial rhythm, and visual hierarchy retain their grace across smartphones, tablets, and ultrawide displays.',
      'Designs are delivered developer-ready with detailed interactive transition states, responsive layout rules, and production-tested design tokens.',
    ],
    inclusions: [
      'Website art direction',
      'Sitemap and page structure',
      'Responsive page layouts',
      'Interaction design',
      'Visual design systems',
      'Developer-ready design handoff',
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
    longDescription: [
      'Exceptional design demands equally peerless code. We engineer high-performance web applications using modern web standards, lightweight component architectures, and responsive layouts that load with blistering speed.',
      'Our engineering approach emphasizes semantic HTML, accessible ARIA attributes, pristine asset optimization, and clean WebGL/Canvas shader integration to achieve fluid 60fps animations without sacrificing battery life or mobile responsiveness.',
      'Every project includes technical SEO foundations, comprehensive cross-browser validation, and clean, modular codebases built for effortless long-term maintenance.',
    ],
    inclusions: [
      'Frontend development',
      'Responsive implementation',
      'Interactive components',
      'Animation integration',
      'Performance optimisation',
      'Technical SEO foundations',
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
    longDescription: [
      'Digital commerce should feel like entering an impeccably curated flagship atelier. We design and build online stores that emphasize high-resolution product storytelling, dynamic collection filtering, and seamless discovery.',
      'From frictionless cart drawers and transparent inventory previews to checkout optimization and secure payment gateway integrations, every touchpoint is engineered to foster customer confidence and minimize drop-off.',
      'Storefronts are built with lightning-fast load times, comprehensive schema markup for search engines, and intuitive administrative workflows for effortless catalog management.',
    ],
    inclusions: [
      'Storefront design and development',
      'Product and collection layouts',
      'Shopping cart and checkout integration',
      'Payment integration where supported',
      'Responsive shopping experiences',
      'Basic performance and SEO foundations',
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
    longDescription: [
      'A landing page has one singular mission: to capture attention, communicate value with immediate resonance, and guide the visitor toward a definitive decision. We build bespoke campaign destinations that achieve that mission with quiet confidence.',
      'By choreographing visual hierarchy, punchy narrative pacing, targeted social proof, and strategically placed calls-to-action, we create engaging narrative journeys that keep visitors focused on what matters most.',
      'Each page is optimized for rapid load times, mobile touch ergonomics, and comprehensive analytics tracking to give your growth team clear behavioral visibility.',
    ],
    inclusions: [
      'Campaign art direction',
      'Conversion-focused page structure',
      'Responsive layouts',
      'Interactive elements',
      'Motion and scroll animations where appropriate',
      'Analytics integration where supported',
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
    longDescription: [
      'Motion is the emotional pulse of modern digital experiences. When executed with precision, animation transforms a static web interface into a living, responsive environment that rewards curiosity and communicates state changes intuitively.',
      'We craft tailored physics-based springs, magnetic cursor dynamics, scroll-linked spatial camera transforms, and bespoke WebGL particle systems that elevate user engagement without adding cognitive fatigue or performance lag.',
      'All choreographies respect user preferences like `prefers-reduced-motion` and are tuned for silky 60fps execution across diverse devices and hardware profiles.',
    ],
    inclusions: [
      'Interface transitions',
      'Scroll-based animation',
      'Micro-interactions',
      'Logo animation and reveals',
      'Interactive visual elements',
      'Motion guidelines',
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
    longDescription: [
      'Bringing a sophisticated digital product to market requires an intimate marriage of strategic product architecture, human-centered UI design, and robust frontend engineering. We partner with founders and enterprise innovators to take concepts from napkin sketches to production platforms.',
      'Our multidisciplinary team defines MVP scopes, validates user workflows, crafts comprehensive component libraries, and develops scalable web application frontends backed by modular API integrations.',
      'We focus on technical longevity, accessibility, state synchronization, and clean design handoffs to ensure your product has a solid foundation for exponential growth.',
    ],
    inclusions: [
      'Product discovery and scope definition',
      'User journeys and wireframes',
      'Interface and experience design',
      'Frontend implementation',
      'Backend or API integration where required',
      'Testing and refinement',
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
