import React, { useEffect } from 'react';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { LayeredHeadingReveal } from '../components/common/LayeredHeadingReveal';
import { BlueEdgeBeam } from '../components/ui/BlueEdgeBeam';
import { Vortex } from '../components/ui/Vortex';
import { Link } from '../router/Router';

export interface ServicesPageProps {
  onOpenInquiry?: (serviceName?: string) => void;
}

interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  destination: string;
  highlightColor: string;
}

const SERVICES_GRID: ServiceCardItem[] = [
  {
    id: 'crafted-websites',
    title: 'Crafted Websites',
    description: 'Custom-built digital flagships designed for clarity, structure, and modern performance.',
    image: '/services/crafted-websites-preview.png',
    alt: 'Crafted Websites — Bespoke ENTROPY studio digital flagship website preview in floating window over blue gradient blueprint grid with Custom badge',
    destination: '/services/website-development',
    highlightColor: 'rgba(56, 189, 248, 0.16)',
  },
  {
    id: 'website-redesign',
    title: 'Website Redesign',
    description: 'Transforming legacy platforms into modern, high-conversion digital experiences.',
    image: '/services/website-redesign.png',
    alt: 'Website Redesign — Layered before-and-after viewports demonstrating evolution from legacy layout to refined modern interface with Custom badge',
    destination: '/services/website-design',
    highlightColor: 'rgba(14, 165, 233, 0.16)',
  },
  {
    id: 'ecommerce-design',
    title: 'eCommerce Website Design',
    description: 'Digital storefronts engineered for product discovery and seamless purchasing.',
    image: '/services/ecommerce-design.png',
    alt: 'eCommerce Website Design — FortuneMakers curated commerce and marketplace advisory platform in floating window with Custom badge',
    destination: '/services/ecommerce-development',
    highlightColor: 'rgba(59, 130, 246, 0.16)',
  },
  {
    id: 'cms-dynamic-websites',
    title: 'CMS & Dynamic Websites',
    description: 'Scalable content management systems empowering teams to iterate with confidence.',
    image: '/services/cms-dynamic-websites.png',
    alt: 'CMS & Dynamic Websites — Structured content management system articles and publication workflow table',
    destination: '/services/website-development',
    highlightColor: 'rgba(6, 182, 212, 0.16)',
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages & Microsites',
    description: 'Focused campaign destinations crafted to communicate value and drive decisive action.',
    image: '/services/landing-pages.png',
    alt: 'Landing Pages & Microsites — Three high-conversion editorial landing page destinations in 3D perspective',
    destination: '/services/landing-pages',
    highlightColor: 'rgba(14, 165, 233, 0.18)',
  },
  {
    id: 'consistent-identity',
    title: 'Consistent Identity',
    description: 'Cohesive brand systems uniting typography, physical media, and digital interfaces.',
    image: '/services/consistent-identity.png',
    alt: 'Consistent Identity — Brand system control panels featuring typography tokens, color palette picker, and logo grid architecture',
    destination: '/services/brand-identity',
    highlightColor: 'rgba(56, 189, 248, 0.16)',
  },
  {
    id: 'ux-strategy',
    title: 'UX-Centric Strategy',
    description: 'Human-centered architectures, flows, and prototypes resolving complex problems.',
    image: '/services/ux-strategy.png',
    alt: 'UX-Centric Strategy — Radial interface architecture connecting wireframes, typography, responsive devices, and design hierarchy around an interactive touch pointer',
    destination: '/services/ui-ux-design',
    highlightColor: 'rgba(34, 211, 238, 0.16)',
  },
  {
    id: 'performance-optimization',
    title: 'Performance Optimization',
    description: 'Sub-second load speeds, optimized assets, and clean technical foundations.',
    image: '/services/performance-optimization.png',
    alt: 'Performance Optimization — Real-time performance dials showcasing 98 Speed, 0.8s load time, 42% asset reduction, and passing Core Web Vitals',
    destination: '/services/website-development',
    highlightColor: 'rgba(14, 165, 233, 0.16)',
  },
  {
    id: 'maintenance-support',
    title: 'Maintenance & Ongoing Support',
    description: 'Proactive uptime monitoring, security updates, and continuous platform stewardship.',
    image: '/services/maintenance-support.png',
    alt: 'Maintenance & Ongoing Support — Systems operational dashboard with 99.9% uptime, active backups, current updates, and incident telemetry timeline',
    destination: '/services/website-development',
    highlightColor: 'rgba(59, 130, 246, 0.16)',
  },
];

/**
 * ENTROPY — Services Page
 * Editorial showcase of ENTROPY's 9 studio capabilities:
 * - Layered heading reveal: 'What we do' gradually slips beneath the dark grid surface on scroll
 * - Clean layout without small pill badges, numbers, or decorative arrows
 * - Two flowing blue light lines traveling around card perimeters on hover
 * - Compact image-led card hierarchy: dominant visual (65-70%), heading strictly first, concise description & Explore pill
 * - Preserves authentic ENTROPY services, high-res assets, and service detail destinations
 */
export const ServicesPage: React.FC<ServicesPageProps> = () => {
  // Ensure smooth scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="relative w-full bg-[#000000] text-[#FFFFFF] min-h-screen pb-20 sm:pb-28 px-4 sm:px-6 select-none overflow-x-hidden">
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

      {/* Subtle page-level environmental blue glow radiating from top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-25 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(14, 165, 233, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
        }}
        aria-hidden="true"
      />

      <LayeredHeadingReveal
        title={
          <>
            What <span className="italic font-light">we do</span>
          </>
        }
        subtitle="We bring strategy, design, and technology together to build distinctive brands and thoughtful digital experiences."
      />

      {/* 
        ======================================================================
        2. FOREGROUND SERVICE GALLERY GRID (z-10, w-full bg-[#000000]/60)
        Naturally passes in front of 'What we do', slowly concealing it from bottom up
        ======================================================================
      */}
      <div className="relative z-10 w-full bg-[#000000]/60 backdrop-blur-[1px]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6">
          <section aria-label="Our Services Grid" className="pt-4 sm:pt-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {SERVICES_GRID.map((service, index) => {
              return (
                <ScrollReveal
                  key={service.id}
                  delay={(index % 3) * 0.08}
                  duration={0.65}
                  yOffset={18}
                  className="h-full"
                >
                  <Link
                    href={service.destination}
                    className="group relative flex flex-col h-full rounded-xl p-[1px] bg-[#07090E] border border-white/[0.07] hover:border-white/[0.12] transition-all duration-300 ease-out overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(2,6,23,0.9),0_0_24px_rgba(14,165,233,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {/* TWO FLOWING BLUE LIGHT LINES AROUND CARD PERIMETER ON HOVER */}
                    <BlueEdgeBeam index={index} />

                    {/* INNER CARD BODY (z-10 over the 1px beam perimeter gap) */}
                    <div className="relative z-10 flex flex-col h-full w-full rounded-[11px] bg-[#07090E] overflow-hidden">
                      {/* Atmospheric Blue Environmental Lighting Backdrop */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${service.highlightColor} 0%, rgba(2, 6, 23, 0) 70%)`,
                        }}
                        aria-hidden="true"
                      />

                      {/* Subtle Technical Dotted Texture */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300"
                        style={{
                          backgroundImage:
                            'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                        aria-hidden="true"
                      />

                      {/* 1. SERVICE IMAGE — Dominant Top Visual (~65–70% of Card Height) */}
                      <div className="relative w-full h-[180px] sm:h-[188px] overflow-hidden bg-[#04060b] border-b border-white/[0.06]">
                        <div
                          className="absolute inset-0 pointer-events-none z-0 opacity-50"
                          style={{
                            background:
                              'radial-gradient(circle at 50% 60%, rgba(14, 165, 233, 0.15) 0%, rgba(4, 6, 11, 0) 70%)',
                          }}
                          aria-hidden="true"
                        />

                        <img
                          src={service.image}
                          alt={service.alt}
                          loading={index < 3 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="relative z-10 w-full h-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
                        />
                      </div>

                      {/* 2. CARD CONTENT AREA (~80–95px Height) */}
                      <div className="relative z-10 flex flex-col justify-between flex-1 p-3.5 sm:p-4">
                        {/* Service Title — Strictly First Text Element Below Image */}
                        <h2 className="font-['Rigter',sans-serif] text-[17px] sm:text-[18px] text-white tracking-tight leading-snug group-hover:text-cyan-50 transition-colors duration-200">
                          {service.title}
                        </h2>

                        {/* Flex Row: Short 2-Line Description + Minimalist Explore Action */}
                        <div className="flex items-end justify-between gap-3 mt-1.5">
                          <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-2 flex-1">
                            {service.description}
                          </p>

                          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.07] group-hover:bg-white/[0.12] border border-white/[0.08] group-hover:border-white/20 text-white text-xs font-medium tracking-wide transition-all duration-200">
                            Explore
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  </div>
);
};

export default ServicesPage;
