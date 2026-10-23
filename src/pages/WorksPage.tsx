import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { LayeredHeadingReveal } from '../components/common/LayeredHeadingReveal';
import { BlueEdgeBeam } from '../components/ui/BlueEdgeBeam';
import { Vortex } from '../components/ui/Vortex';
import { ProjectItem, projectsData } from '../data/projectsData';
import { trackEvent } from '../lib/analytics';

export interface WorksPageProps {
  onSelectProject?: (project: ProjectItem) => void;
  onOpenInquiry?: () => void;
}

export interface PortfolioProject {
  id: string;
  name: string;
  displayCategory: string;
  categories: string[];
  url: string;
  image: string;
  alt: string;
  badgeText?: string;
  projectItem?: ProjectItem;
  classification?: 'Client Work' | 'Studio Concept' | 'Demonstration Platform' | 'UI/UX Case Study';
}

/**
 * Verified 15 Studio Projects matching authentic live production deployments:
 * 1. GLITCH — https://glitchcolhing.netlify.app/
 * 2. BEYOND GROWTH — https://beyondgrowth.netlify.app/
 * 3. LUMINA — https://luminawebagencie.netlify.app/
 * 4. JOURNEY AI — https://journeywithai.netlify.app/
 * 5. SNOW LUXURY — https://snowluxury.netlify.app/
 * 6. BUILDERAURA — https://buidleraura.netlify.app/
 * 7. VOLTIXAURA — https://voltixaura.netlify.app/
 * 8. TRAVEL JAPAN ESCAPE — https://traveljapanescape.netlify.app/
 * 9. QUIET SHELF — https://quiteshelf.netlify.app/
 * 10. HIROSHI / SAMURAI — https://hiroshi-samurai.netlify.app/
 * 11. GUJARAT MANPOWER SERVICES — https://gujaratmanpowerservices.com/
 * 12. BITES BOMBAY SANDWICH — https://bitesbombaysandwich.in/
 * 13. FORTUNEMAKERS — https://fortunemakeres.netlify.app/
 * 14. PAWS & PURRS — https://pawspurs.netlify.app/
 * 15. ATELIER KITCHENS — https://atelierkithcens.netlify.app/
 */
const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'pulse',
    name: 'PULSE',
    displayCategory: 'UI/UX Design · Health Tech',
    categories: ['UI/UX', 'Healthcare', 'Creative'],
    url: '/services/ui-ux-design',
    image: '/projects/pulse.webp',
    alt: 'PULSE — Health, sleep tracking and mindfulness mobile application UI/UX design',
    badgeText: 'View Case Study',
    classification: 'UI/UX Case Study',
  },
  {
    id: 'redesign-it',
    name: 'REDESIGN IT',
    displayCategory: 'UI/UX Design · Spatial App',
    categories: ['UI/UX', 'Creative', 'eCommerce'],
    url: '/services/ui-ux-design',
    image: '/projects/redesign-it.webp',
    alt: 'ReDesign it — Spatial interior architecture and room staging mobile application UI/UX',
    badgeText: 'View Case Study',
    classification: 'UI/UX Case Study',
  },
  {
    id: 'glitch',
    name: 'GLITCH',
    displayCategory: 'eCommerce',
    categories: ['eCommerce', 'Creative'],
    url: 'https://glitchcolhing.netlify.app/',
    image: '/projects/glitch.webp',
    alt: 'GLITCH — Futuristic apparel storefront and cyberpunk streetwear catalog',
    classification: 'Demonstration Platform',
  },
  {
    id: 'beyond-growth',
    name: 'BEYOND GROWTH',
    displayCategory: 'Healthcare',
    categories: ['Healthcare', 'Corporate', 'Creative'],
    url: 'https://beyondgrowth.netlify.app/',
    image: '/projects/beyond-growth.webp',
    alt: 'BEYOND — Holistic personal development, executive coaching and wellness platform',
    classification: 'Demonstration Platform',
  },
  {
    id: 'lumina',
    name: 'LUMINA',
    displayCategory: 'SaaS',
    categories: ['SaaS', 'Corporate'],
    url: 'https://luminawebagencie.netlify.app/',
    image: '/projects/lumina.webp',
    alt: 'LUMINA — Next-generation digital design agency showcase with interactive lighting',
    classification: 'Demonstration Platform',
  },
  {
    id: 'journey-ai',
    name: 'JOURNEY AI',
    displayCategory: 'SaaS',
    categories: ['SaaS', 'Creative'],
    url: 'https://journeywithai.netlify.app/',
    image: '/projects/journey-ai.webp',
    alt: 'JOURNEY AI — Ambient workflow intelligence platform with kinetic typography',
    classification: 'Demonstration Platform',
  },
  {
    id: 'snow-luxury',
    name: 'SNOW LUXURY',
    displayCategory: 'eCommerce',
    categories: ['eCommerce', 'Creative'],
    url: 'https://snowluxury.netlify.app/',
    image: '/projects/snow-luxury.webp',
    alt: 'SNOW LUXURY — Minimalist haute horlogerie atelier featuring sapphire-crystal case studies',
    classification: 'Demonstration Platform',
  },
  {
    id: 'builderaura',
    name: 'BUILDERAURA',
    displayCategory: 'SaaS',
    categories: ['SaaS', 'Corporate'],
    url: 'https://buidleraura.netlify.app/',
    image: '/projects/builderaura.webp',
    alt: 'BUILDERAURA — Spatial construction management platform with interactive architectural blueprints',
    classification: 'Demonstration Platform',
  },
  {
    id: 'voltixaura',
    name: 'VOLTIXAURA',
    displayCategory: 'SaaS',
    categories: ['SaaS', 'Corporate'],
    url: 'https://voltixaura.netlify.app/',
    image: '/projects/voltixaura.webp',
    alt: 'VOLTIX — Industrial grid telemetry and high-voltage renewable energy monitoring platform',
    classification: 'Demonstration Platform',
  },
  {
    id: 'travel-japan-escape',
    name: 'TRAVEL JAPAN ESCAPE',
    displayCategory: 'Blog',
    categories: ['Blog', 'Creative'],
    url: 'https://traveljapanescape.netlify.app/',
    image: '/projects/travel-japan-escape.webp',
    alt: 'TRAVEL JAPAN ESCAPE — Immersive travel journal and editorial guide across Tokyo, Kyoto and Hokkaido',
    classification: 'Demonstration Platform',
  },
  {
    id: 'quiet-shelf',
    name: 'QUIET SHELF',
    displayCategory: 'eCommerce',
    categories: ['eCommerce', 'Blog'],
    url: 'https://quiteshelf.netlify.app/',
    image: '/projects/quiet-shelf.webp',
    alt: 'QUIET SHELF — Editorial independent book publisher with linen textures and warm typography',
    classification: 'Demonstration Platform',
  },
  {
    id: 'hiroshi-samurai',
    name: 'HIROSHI / SAMURAI',
    displayCategory: 'Creative',
    categories: ['Creative'],
    url: 'https://hiroshi-samurai.netlify.app/',
    image: '/projects/hiroshi-samurai.webp',
    alt: 'HIROSHI — Archival tribute to feudal Japanese craftsmanship, samurai blade metallurgy and calligraphic heritage',
    classification: 'Demonstration Platform',
  },
  {
    id: 'gujarat-manpower',
    name: 'GUJARAT MANPOWER',
    displayCategory: 'Corporate',
    categories: ['Corporate'],
    url: 'https://gujaratmanpowerservices.com/',
    image: '/projects/gujarat-manpower.webp',
    alt: 'GUJARAT MANPOWER — Enterprise industrial staffing solutions across manufacturing and logistical corridors',
    classification: 'Client Work',
  },
  {
    id: 'bites-bombay',
    name: 'BITES BOMBAY SANDWICH',
    displayCategory: 'eCommerce',
    categories: ['eCommerce', 'Creative'],
    url: 'https://bitesbombaysandwich.in/',
    image: '/projects/bites-bombay.webp',
    alt: 'BITES BOMBAY — Vibrant culinary storefront celebrating artisanal street gourmet cuisine and spiced sandwiches',
    classification: 'Client Work',
  },
  {
    id: 'fortune-makers',
    name: 'FORTUNEMAKERS',
    displayCategory: 'Corporate',
    categories: ['Corporate', 'SaaS'],
    url: 'https://fortunemakeres.netlify.app/',
    image: '/projects/fortune-makers.webp',
    alt: 'FORTUNEMAKERS — Strategic investment advisory firm and wealth management portal',
    classification: 'Demonstration Platform',
  },
  {
    id: 'paws-purrs',
    name: 'PAWS & PURRS',
    displayCategory: 'eCommerce',
    categories: ['eCommerce'],
    url: 'https://pawspurs.netlify.app/',
    image: '/projects/paws-purrs.webp',
    alt: 'PAWS & PURRS — Premium organic companion care boutique and veterinary nutrition storefront',
    classification: 'Demonstration Platform',
  },
  {
    id: 'atelier-kitchen',
    name: 'ATELIER KITCHENS',
    displayCategory: 'Corporate',
    categories: ['Corporate', 'Creative'],
    url: 'https://atelierkithcens.netlify.app/',
    image: '/projects/atelier-kitchen.webp',
    alt: 'ATELIER KITCHENS — Bespoke architectural cabinetry, marble countertops, and handcrafted European kitchen spaces',
    classification: 'Demonstration Platform',
  },
];

const CATEGORIES = [
  'All',
  'UI/UX',
  'Corporate',
  'Creative',
  'SaaS',
  'Healthcare',
  'eCommerce',
  'Blog',
] as const;

type CategoryType = (typeof CATEGORIES)[number];

/**
 * ENTROPY — Works Portfolio Page
 * Minimal black background, layered heading reveal, functional pill-shaped category filters,
 * and a 3-column responsive grid with two flowing blue light streaks traveling along card perimeters on hover.
 */
export const WorksPage: React.FC<WorksPageProps> = ({ onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const shouldReduceMotion = useReducedMotion();

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return PORTFOLIO_PROJECTS;
    return PORTFOLIO_PROJECTS.filter((project) =>
      project.categories.includes(activeCategory)
    );
  }, [activeCategory]);

  return (
    <div className="relative w-full bg-[#000000] text-[#FFFFFF] min-h-screen pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 select-none overflow-x-hidden">
      {/* 
        ======================================================================
        0. VORTEX ANIMATION BACKGROUND (Atmospheric Swirling Particle Field)
        ======================================================================
      */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60 mix-blend-screen"
        aria-hidden="true"
      >
        <Vortex
          backgroundColor="#000000"
          rangeY={180}
          particleCount={520}
          baseHue={212}
          rangeHue={38}
          baseSpeed={0.12}
          rangeSpeed={1.1}
          baseRadius={0.8}
          rangeRadius={1.8}
          containerClassName="w-full h-full"
        />
      </div>

      {/* 
        ======================================================================
        1. LAYERED SCROLL-LINKED HEADING REVEAL (z-0)
        ======================================================================
      */}
      <LayeredHeadingReveal
        title={
          <>
            Our <span className="italic font-light">Works</span>
          </>
        }
        subtitle="Curated digital flagship experiences, brand systems, and web architectures crafted with intent."
      />

      <div className="relative z-10 w-full bg-[#000000]/60 backdrop-blur-[1px]">
        <div className="max-w-[1360px] mx-auto">
        {/* 
          ======================================================================
          2. FUNCTIONAL CATEGORY FILTER PILLS (Preserved)
          ======================================================================
        */}
        <nav
          aria-label="Filter works by industry category"
          className="w-full flex justify-center mb-8 sm:mb-10 pt-2"
        >
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto max-w-full pb-2.5 sm:pb-1 pt-1 gap-2 sm:gap-2.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-[12.5px] font-['Inter',sans-serif] font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 select-none ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#080808] font-semibold shadow-sm'
                      : 'bg-transparent text-[#A0A0A0] border border-[#262626] hover:border-[#404040] hover:text-[#FFFFFF]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 
          ======================================================================
          3. RESPONSIVE THREE-COLUMN PROJECT GRID WITH DUAL BLUE LIGHT LINES
          ======================================================================
        */}
        <section aria-label="Portfolio Project Gallery" className="w-full">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5 lg:gap-5 items-stretch"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isExternal = project.url.startsWith('http');
                const targetItem =
                  project.projectItem ||
                  projectsData.find((p) => p.id === project.id);

                return (
                  <motion.div
                    layout
                    key={project.id}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.6,
                      delay: shouldReduceMotion ? 0 : Math.min((index % 3) * 0.08, 0.24),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full"
                  >
                    <a
                      href={project.url}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      onClick={(e) => {
                        trackEvent('portfolio_project_opened', {
                          project_id: project.id,
                          project_name: project.name,
                          url: project.url,
                          category: project.displayCategory,
                        });
                        if (!isExternal && onSelectProject && targetItem) {
                          e.preventDefault();
                          onSelectProject(targetItem);
                        }
                      }}
                      aria-label={
                        isExternal
                          ? `View live site for ${project.name} (opens in a new tab)`
                          : `View case study for ${project.name}`
                      }
                      className="group relative bg-[#07070a] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-[1px] flex flex-col justify-between h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8),0_0_25px_rgba(14,165,233,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40 cursor-pointer overflow-hidden block"
                    >
                      {/* TWO FLOWING BLUE LIGHT LINES AROUND CARD PERIMETER ON HOVER */}
                      <BlueEdgeBeam index={index} />

                      {/* INNER CARD BODY (z-10 over the 1px beam perimeter gap) */}
                      <div className="relative z-10 flex flex-col justify-between h-full w-full rounded-[15px] bg-[#07070a] p-3 sm:p-3.5 overflow-hidden">
                        {/* Website Screenshot Container with Soft Blur & 'View Site ↗' Hover Overlay */}
                        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#000000] relative mb-2.5 sm:mb-3 border border-white/[0.04]">
                          {/* Authentic Project Screenshot */}
                          <img
                            src={project.image}
                            alt={project.alt}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-[filter,transform] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:blur-[4px] group-hover:brightness-[0.75] group-hover:scale-[1.025] group-focus-visible:blur-[4px] group-focus-visible:brightness-[0.75] group-focus-visible:scale-[1.025] motion-reduce:group-hover:blur-0 motion-reduce:group-hover:brightness-90 motion-reduce:group-hover:scale-100"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('/screenshot/')) {
                                target.src = `/screenshot/${project.id}.webp`;
                              }
                            }}
                          />

                          {/* Hover 'View Site ↗' or 'View Case Study ↗' Pill Badge */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                            aria-hidden="true"
                          >
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/30 text-white text-xs sm:text-[13px] font-['Inter',sans-serif] font-medium tracking-wide shadow-xl transform translate-y-2 group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                              <span>
                                {project.badgeText || (isExternal ? 'View Site' : 'View Case Study')}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                            </div>
                          </div>
                        </div>

                        {/* Metadata Row: Project Title, Category & Mobile Discoverable Affordance */}
                        <div className="flex items-center justify-between gap-3 px-1 py-0.5">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-[15px] font-['Inter',sans-serif] font-medium text-white tracking-tight truncate leading-snug">
                              {project.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-[#8E8E93] font-['Inter',sans-serif] font-normal truncate">
                                {project.displayCategory}
                              </p>
                              {project.classification && (
                                <span className="text-[9.5px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[#A1A1A6] shrink-0">
                                  {project.classification}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-['Inter',sans-serif] text-[#71717A] group-hover:text-white transition-colors duration-200"
                            aria-hidden="true"
                          >
                            <span>{isExternal ? 'View site' : 'Case study'}</span>
                            <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </div>
  </div>
);
};

export default WorksPage;
