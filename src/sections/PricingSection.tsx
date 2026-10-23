import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  PRICING_FILTERS,
  getPricingPackagesByFilter,
} from '../data/pricingData';
import { PricingCard } from '../components/pricing/PricingCard';
import { ScrollReveal } from '../components/common/ScrollReveal';

interface PricingSectionProps {
  onOpenInquiry?: (serviceName?: string) => void;
  className?: string;
}

/**
 * ENTROPY — Pricing Section
 * Minimal, editorial pricing experience inspired by studio reference:
 * - Centered 'Pricing' heading in Rigter font
 * - Compact 10-item filter row with horizontal scrolling on mobile
 * - Exactly three responsive pricing cards per filter
 * - Slow white light ray travelling around card borders
 * - Subtle obsidian glass & brushed graphite background texture
 * - Small studio note beneath cards
 */
export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const reduce = useReducedMotion();

  const currentPackages = getPricingPackagesByFilter(activeFilter);

  return (
    <section
      id="pricing"
      aria-label="Studio Pricing & Engagement Packages"
      className={`relative w-full bg-[#000000] pt-24 sm:pt-32 lg:pt-36 pb-24 sm:pb-32 lg:pb-36 text-[#F5F5F7] overflow-hidden ${className}`}
    >
      {/* Soft top gradient blend from previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-24 sm:h-36 bg-gradient-to-b from-[#000000] via-[#000000]/75 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      <ScrollReveal yOffset={24}>
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          
          {/* Section Header: Centered Large 'Pricing' Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-['Rigter',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] text-white tracking-tight leading-none select-none">
              Pricing
            </h2>
          </div>

          {/* 
            Filter Controls Row:
            - Compact, pill-styled filter buttons
            - Horizontally scrollable on mobile without causing page overflow
            - Active item highlighted with subtle white fill/border
          */}
          <div className="w-full mb-12 sm:mb-16">
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-3 sm:pb-1 pt-1 gap-2 sm:gap-2.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
              {PRICING_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 select-none ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm scale-[1.02]'
                        : 'bg-white/[0.04] text-[#A1A1A6] hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
                    }`}
                    aria-pressed={isActive}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 
            Three-Card Pricing Grid:
            - Exactly three equal-width cards on desktop
            - Responsive 1-col on mobile, 2 or 3-col on tablet/desktop
            - Smooth in-place crossfade transition on filter change
          */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 items-stretch"
              >
                {currentPackages.map((pkg, index) => (
                  <PricingCard
                    key={pkg.id}
                    pkg={pkg}
                    index={index}
                    onOpenInquiry={onOpenInquiry}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>



        </div>
      </ScrollReveal>
    </section>
  );
};

export default PricingSection;
