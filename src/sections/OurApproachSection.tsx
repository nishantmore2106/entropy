import React from 'react';
import { ScrollReveal } from '../components/common/ScrollReveal';

export interface ApproachCardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  spanClass: string;
  objectPosition: string;
}

export const ourApproachCards: ApproachCardItem[] = [
  {
    id: 'strategy',
    title: 'Strategy before execution',
    description: 'We define the direction before we begin creating.',
    image: '/approach/strategy-mockup.webp',
    alt: 'Creative strategy materials with tablet visual direction presentation, paper boards, and color swatches',
    spanClass: 'lg:col-span-7',
    objectPosition: 'object-[center_bottom] sm:object-[center_65%]',
  },
  {
    id: 'design',
    title: 'Design with intention',
    description: 'Every detail serves a purpose.',
    image: '/approach/design-mockup.webp',
    alt: 'Ultra-thin space-gray laptop displaying website interface with floating typography specimen sheets',
    spanClass: 'lg:col-span-5',
    objectPosition: 'object-[center_bottom] sm:object-[center_60%]',
  },
  {
    id: 'experience',
    title: 'Built around people',
    description: 'We make digital experiences clear and intuitive.',
    image: '/approach/experience-mockup.webp',
    alt: 'Layered borderless modern smartphones displaying polished digital product user interfaces',
    spanClass: 'lg:col-span-5',
    objectPosition: 'object-[center_bottom] sm:object-[center_70%]',
  },
  {
    id: 'technology',
    title: 'Precision in technology',
    description: 'We build with care, performance, and detail in mind.',
    image: '/approach/technology-mockup.webp',
    alt: 'High-performance desktop studio monitor display showing responsive web app beside companion preview tablet',
    spanClass: 'lg:col-span-7',
    objectPosition: 'object-[center_bottom] sm:object-[center_55%]',
  },
];

interface OurApproachSectionProps {
  className?: string;
}

/**
 * ENTROPY — Our Approach Section
 * Four-card asymmetrical editorial layout featuring the four physical product
 * and device mockup compositions recreated from the reference design.
 */
export const OurApproachSection: React.FC<OurApproachSectionProps> = ({
  className = '',
}) => {
  return (
    <section
      id="approach"
      aria-label="Our Approach — Studio Philosophy"
      className={`relative w-full bg-[#000000] pt-24 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 lg:pb-36 text-[#F5F5F7] overflow-hidden ${className}`}
    >
      {/* Top transition gradient blend from Pricing Section */}
      <div
        className="absolute top-0 left-0 right-0 h-24 sm:h-36 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal yOffset={24}>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <p className="text-xs sm:text-sm font-medium tracking-[0.16em] text-[#8E8E93] mb-3 select-none">
              Our philosophy
            </p>
            <h2 className="font-['Rigter',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] text-white tracking-tight leading-none select-none">
              Good work starts with good thinking.
            </h2>
          </div>
        </ScrollReveal>

        {/* 
          Four-Card Editorial Grid:
          Row 1: Card 1 (7 cols) + Card 2 (5 cols)
          Row 2: Card 3 (5 cols) + Card 4 (7 cols)
        */}
        <ScrollReveal yOffset={28}>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
            {ourApproachCards.map((card) => (
              <div
                key={card.id}
                className={`${card.spanClass} group relative flex flex-col justify-between rounded-2xl sm:rounded-[24px] border border-white/[0.12] hover:border-white/30 p-6 sm:p-8 lg:p-9 transition-all duration-500 ease-out hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(20,60,180,0.15)] overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] bg-[#070913]`}
              >
                {/* Full-bleed Composition Artwork with its own rich environmental background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none rounded-2xl sm:rounded-[24px]">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className={`w-full h-full object-cover ${card.objectPosition} transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none`}
                    loading="lazy"
                  />

                  {/* Refined localized top vignette ensuring typography stands out with absolute clarity */}
                  <div
                    className="absolute top-0 inset-x-0 h-44 sm:h-52 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Subtle inner card border highlight */}
                  <div
                    className="absolute inset-0 ring-1 ring-inset ring-white/[0.08] pointer-events-none rounded-2xl sm:rounded-[24px]"
                    aria-hidden="true"
                  />
                </div>

                {/* Card Header Text Area */}
                <div className="relative z-10 max-w-md">
                  <h3 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl text-white tracking-tight mb-2 select-none drop-shadow-md">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#D1D1D6] font-normal leading-relaxed drop-shadow-md">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default OurApproachSection;
