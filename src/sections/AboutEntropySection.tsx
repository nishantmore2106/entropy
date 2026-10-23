import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { GetStartedButton } from '../components/ui/GetStartedButton';

/**
 * ENTROPY — Section 02: Who We Are
 * Editorial studio presentation:
 * - Left side: Anchored editorial statement with Rigter heading & standardized GetStartedButton CTAs
 * - Right side: Exactly three horizontal rows of authentic mockups from public/mockups
 *   Scroll-linked horizontal movement:
 *   - Row 1: moves left as user scrolls down
 *   - Row 2: moves right as user scrolls down
 *   - Row 3: moves left as user scrolls down
 * - Reverses naturally when scrolling up
 * - Restrained travel distances, zero horizontal overflow, respects prefers-reduced-motion
 */

interface MockupTile {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  flex: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW 1: Digital Platform, 3D Spatial UI & Dynamic Generative Identity
// ─────────────────────────────────────────────────────────────────────────────
const ROW_1_MOCKUPS: MockupTile[] = [
  {
    id: 'orbit-monitor',
    title: 'Orbit — Smart Money in Motion',
    category: 'Digital Platform / Web Interface',
    src: '/mockups/image.png',
    alt: 'Orbit digital fintech platform and design system on modern studio display',
    flex: 'flex-[1.33]',
  },
  {
    id: 'orbit-glass-app',
    title: 'Orbit — Translucent Spatial App Experience',
    category: 'Spatial UI / 3D Iconography',
    src: '/mockups/image%20copy.png',
    alt: 'Orbit mobile application with translucent glass 3D icon and spatial interface',
    flex: 'flex-[1.5]',
  },
  {
    id: 'orbit-fluid-wave',
    title: 'Orbit — Fluid Dynamic Identity Emblem',
    category: 'Generative Art / Motion System',
    src: '/mockups/image%20copy%202.png',
    alt: 'Vibrant blue-cyan generative fluid wave emblem and logo banner',
    flex: 'flex-[1.78]',
  },
  {
    id: 'menverse-packaging',
    title: 'Menverse — Minimal Matte Shopping Packaging',
    category: 'Luxury Packaging / Print Identity',
    src: '/mockups/image%20copy%205.png',
    alt: 'Menverse luxury black paper shopping bag with rope handles and debossed crest',
    flex: 'flex-[1.5]',
  },
  {
    id: 'pillar-wall-sign',
    title: 'Pillar — Architectural Monogram Signage',
    category: 'Spatial Design / Monogram',
    src: '/mockups/image%20copy%208.png',
    alt: 'Pillar architectural square wall sign with illuminated column monogram',
    flex: 'flex-[1.5]',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROW 2: Editorial Identity, Packaging & Material Details
// ─────────────────────────────────────────────────────────────────────────────
const ROW_2_MOCKUPS: MockupTile[] = [
  {
    id: 'koru-stationery',
    title: 'Koru — Botanical Letterhead & Stationery',
    category: 'Brand Collateral / Print Identity',
    src: '/mockups/image%20copy%204.png',
    alt: 'Koru embossed stationery and business card mockup with olive leaf shadows',
    flex: 'flex-[1.25]',
  },
  {
    id: 'menverse-hang-tags',
    title: 'Menverse — Apparel Hang Tags & Material Study',
    category: 'Apparel Identity / Material Texture',
    src: '/mockups/image%20copy%206.png',
    alt: 'Menverse minimal matte black product tags pinned to heavyweight textile',
    flex: 'flex-[1.5]',
  },
  {
    id: 'pillar-gift-box',
    title: 'Pillar — Debossed Monogram Rigid Box',
    category: 'Luxury Packaging / Debossing',
    src: '/mockups/image%20copy%209.png',
    alt: 'Pillar textured black gift box with precision debossed monogram lid',
    flex: 'flex-[1.5]',
  },
  {
    id: 'velora-tech-merch',
    title: 'Velora — Kinetic Hardware & Merchandise Kit',
    category: 'Product Packaging / Tech Lifestyle',
    src: '/mockups/image%20copy%2010.png',
    alt: 'Velora Move Differently merchandise box and matte black bottle',
    flex: 'flex-[1.5]',
  },
  {
    id: 'morva-gift-box',
    title: 'Morva — Organic Packaging & Editorial Tag',
    category: 'Packaging Design / Tactile Print',
    src: '/mockups/image%20copy%2013.png',
    alt: 'Morva beige linen gift box with debossed typography and natural botanical sprig',
    flex: 'flex-[1.5]',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROW 3: Physical Spaces, Architectural Studio & Dimensional Identity
// ─────────────────────────────────────────────────────────────────────────────
const ROW_3_MOCKUPS: MockupTile[] = [
  {
    id: 'menverse-boutique',
    title: 'Menverse — Minimal Architectural Boutique',
    category: 'Environmental Branding / Retail',
    src: '/mockups/image%20copy%207.png',
    alt: 'Menverse illuminated minimalist boutique storefront with black stone facade',
    flex: 'flex-[1.5]',
  },
  {
    id: 'koru-exterior-sign',
    title: 'Koru — Botanical Studio Hanging Blade Sign',
    category: 'Environmental Signage / Studio Identity',
    src: '/mockups/image%20copy%203.png',
    alt: 'Koru organic hanging blade sign mounted on modern studio exterior',
    flex: 'flex-[1.25]',
  },
  {
    id: 'velora-office-typography',
    title: 'Velora — Move Differently Dimensional Wall',
    category: 'Environmental Graphics / 3D Typography',
    src: '/mockups/image%20copy%2011.png',
    alt: 'Velora precision 3D matte black wall typography in creative technology studio',
    flex: 'flex-[1.5]',
  },
  {
    id: 'morva-timber-tag',
    title: 'Morva — Made for the Everyday Hang Tag',
    category: 'Product Tag / Editorial Craft',
    src: '/mockups/image%20copy%2012.png',
    alt: 'Morva burgundy editorial product tag hanging from natural oak furniture frame',
    flex: 'flex-[1.5]',
  },
  {
    id: 'morva-interior-wall',
    title: 'Morva — Studio Living Signage & Wall Identity',
    category: 'Interior Typography / Studio Spaces',
    src: '/mockups/image%20copy%2014.png',
    alt: 'Morva architectural studio interior with clean dimensional wall lettering',
    flex: 'flex-[1.5]',
  },
];

// Mobile curated selection (8 balanced mockups)
const MOBILE_MOCKUPS = [
  ROW_1_MOCKUPS[0],
  ROW_1_MOCKUPS[1],
  ROW_1_MOCKUPS[2],
  ROW_2_MOCKUPS[0],
  ROW_1_MOCKUPS[3],
  ROW_2_MOCKUPS[1],
  ROW_3_MOCKUPS[0],
  ROW_3_MOCKUPS[2],
];

export const AboutEntropySection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll progress linked to this section's vertical travel in viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Smooth scroll-linked horizontal translations:
  // Row 1: moves towards the LEFT as user scrolls down
  const row1X = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0px', '0px'] : ['55px', '-55px']
  );

  // Row 2: moves towards the RIGHT as user scrolls down
  const row2X = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0px', '0px'] : ['-55px', '55px']
  );

  // Row 3: moves towards the LEFT as user scrolls down
  const row3X = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0px', '0px'] : ['55px', '-55px']
  );

  // Mobile subtle shift
  const mobileRow1X = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0px', '0px'] : ['18px', '-18px']
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="Who we are — ENTROPY Creative Technology Studio"
      className="relative w-full bg-[#000000] text-white pt-24 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 lg:pb-40 overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────────
          SECTION-LEVEL BLENDING GRADIENTS (Soft cinematic dark transitions)
          ───────────────────────────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 top-0 h-24 sm:h-36 bg-gradient-to-b from-[#000000] via-[#000000]/70 to-transparent pointer-events-none z-20"
        aria-hidden="true"
      />

      <div
        className="absolute left-0 right-0 bottom-0 h-28 sm:h-40 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent pointer-events-none z-20"
        aria-hidden="true"
      />

      {/* Section Content Wrapper */}
      <div className="w-full pl-5 sm:pl-8 lg:pl-12 xl:pl-16 pr-5 sm:pr-8 lg:pr-6 xl:pr-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-8 xl:gap-12">
          
          {/* ─────────────────────────────────────────────────────────────────
              LEFT SIDE: EDITORIAL STATEMENT (approx. 30–33% width on desktop)
              Sticky positioning on desktop — does NOT move with image rows
              ───────────────────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[34%] xl:w-[31%] shrink-0 lg:sticky lg:top-32 xl:top-36 z-30 self-start">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Eyebrow — Natural title case */}
              <p className="text-xs sm:text-sm font-medium tracking-[0.16em] text-[#8E8E93] mb-4 sm:mb-5">
                Who we are
              </p>

              {/* Main Heading — Rigter Font, Natural sentence case */}
              <h2 className="font-['Rigter',sans-serif] text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] xl:text-[3.65rem] text-white tracking-tight leading-[1.08] mb-6 sm:mb-7">
                We turn ideas into distinctive digital experiences.
              </h2>

              {/* Concise Supporting Paragraph */}
              <p className="text-sm sm:text-base md:text-lg text-[#A1A1A6] leading-relaxed max-w-xl font-normal mb-8 sm:mb-10">
                ENTROPY brings brand, design, and technology together to create distinctive identities and digital experiences.
              </p>

              {/* Standardized GetStartedButton Actions */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                <GetStartedButton
                  to="/about-us"
                  defaultText="About us"
                  hoverText="Studio story"
                  className="min-w-[130px]"
                />

                <GetStartedButton
                  to="/works"
                  variant="secondary"
                  defaultText="See our work"
                  hoverText="Explore projects"
                  className="min-w-[140px]"
                />
              </div>
            </motion.div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              RIGHT SIDE: EXACTLY THREE HORIZONTAL ROWS (Desktop & Tablet)
              Clipped cleanly within container without horizontal overflow
              ───────────────────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[66%] xl:w-[69%] relative z-10 overflow-hidden rounded-2xl">
            
            {/* Soft Left Edge Gradient Fade into editorial text column */}
            <div
              className="hidden md:block absolute left-0 top-0 bottom-0 w-20 sm:w-28 lg:w-36 bg-gradient-to-r from-[#000000] via-[#000000]/85 to-transparent pointer-events-none z-20 backdrop-blur-[1px]"
              aria-hidden="true"
            />

            {/* Soft Right Edge Fade */}
            <div
              className="hidden md:block absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-[#000000] to-transparent pointer-events-none z-20"
              aria-hidden="true"
            />

            {/* ── TABLET & DESKTOP: THREE HORIZONTALLY MOVING ROWS ── */}
            <div className="hidden md:flex flex-col gap-3.5 sm:gap-4 lg:gap-4.5 xl:gap-5 w-full py-1">
              
              {/* ── ROW 1: Moves LEFT on scroll down ── */}
              <motion.div
                style={{ x: row1X }}
                className="flex gap-3 sm:gap-3.5 lg:gap-4 xl:gap-5 items-stretch h-[155px] md:h-[180px] lg:h-[205px] xl:h-[230px] 2xl:h-[250px] w-[calc(100%+120px)] -ml-[60px] will-change-transform"
              >
                {ROW_1_MOCKUPS.map((item) => (
                  <div
                    key={item.id}
                    className={`${item.flex} min-w-[210px] sm:min-w-[240px] lg:min-w-[270px] h-full rounded-xl overflow-hidden bg-[#0D0D12] border border-[#1A1A22]/80 hover:border-[#383846] transition-all duration-300 relative group cursor-default`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.02] group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                  </div>
                ))}
              </motion.div>

              {/* ── ROW 2: Moves RIGHT on scroll down ── */}
              <motion.div
                style={{ x: row2X }}
                className="flex gap-3 sm:gap-3.5 lg:gap-4 xl:gap-5 items-stretch h-[155px] md:h-[180px] lg:h-[205px] xl:h-[230px] 2xl:h-[250px] w-[calc(100%+120px)] -ml-[60px] will-change-transform"
              >
                {ROW_2_MOCKUPS.map((item) => (
                  <div
                    key={item.id}
                    className={`${item.flex} min-w-[210px] sm:min-w-[240px] lg:min-w-[270px] h-full rounded-xl overflow-hidden bg-[#0D0D12] border border-[#1A1A22]/80 hover:border-[#383846] transition-all duration-300 relative group cursor-default`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.02] group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                  </div>
                ))}
              </motion.div>

              {/* ── ROW 3: Moves LEFT on scroll down ── */}
              <motion.div
                style={{ x: row3X }}
                className="flex gap-3 sm:gap-3.5 lg:gap-4 xl:gap-5 items-stretch h-[155px] md:h-[180px] lg:h-[205px] xl:h-[230px] 2xl:h-[250px] w-[calc(100%+120px)] -ml-[60px] will-change-transform"
              >
                {ROW_3_MOCKUPS.map((item) => (
                  <div
                    key={item.id}
                    className={`${item.flex} min-w-[210px] sm:min-w-[240px] lg:min-w-[270px] h-full rounded-xl overflow-hidden bg-[#0D0D12] border border-[#1A1A22]/80 hover:border-[#383846] transition-all duration-300 relative group cursor-default`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.02] group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                  </div>
                ))}
              </motion.div>

            </div>

            {/* ── MOBILE: CLEAN RESPONSIVE 2-COLUMN GRID (Prevents horizontal overflow) ── */}
            <motion.div
              style={{ x: mobileRow1X }}
              className="grid md:hidden grid-cols-2 gap-3 sm:gap-3.5 w-[calc(100%+36px)] -ml-[18px]"
            >
              {MOBILE_MOCKUPS.map((item) => (
                <div
                  key={`m-${item.id}`}
                  className="relative aspect-[16/11] rounded-lg sm:rounded-xl overflow-hidden bg-[#0D0D12] border border-[#1A1A22]/80"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover object-center filter brightness-[0.96]"
                  />
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                </div>
              ))}
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutEntropySection;
