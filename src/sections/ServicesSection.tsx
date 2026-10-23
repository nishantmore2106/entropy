import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { servicesData, ServiceArea } from '../data/servicesData';

interface ServicesSectionProps {
  onOpenInquiry: (serviceName?: string) => void;
  className?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="services"
      aria-label="Services and Capabilities"
      className={`relative w-full bg-[#000000] text-[#F4F4F2] py-20 sm:py-28 md:py-36 px-5 sm:px-8 lg:px-12 border-t border-[#1C1C22] select-none ${className}`}
    >
      <div className="max-w-[1500px] mx-auto">
        {/* =================================================================
            SECTION INTRODUCTION HEADER ROW
            Two-column editorial header with headline and capability action
            ================================================================= */}
        <div className="pb-10 sm:pb-14 md:pb-16 border-b border-[#1C1C22] flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
          {/* Left: Section Headline */}
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold tracking-[-0.03em] text-[#F4F4F2] leading-[1.18]">
              We Build Brands and Digital Experiences That Move Businesses Forward.
            </h2>
          </div>

          {/* Right: Understated Capabilities Label / Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onOpenInquiry('Capabilities Overview')}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#E4E4E7] transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              aria-label="Explore our capabilities and initiate project enquiry"
            >
              <span>Our Capabilities</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* =================================================================
            EDITORIAL SERVICE ROWS (01 - 04)
            High-contrast, numbered horizontal rows with large display titles
            ================================================================= */}
        <div className="divide-y divide-[#1C1C22]">
          {servicesData.map((service: ServiceArea) => {
            const isHovered = hoveredId === service.id;
            const isUiUx = service.id === 'ui-ux';

            return (
              <div
                key={service.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenInquiry(service.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenInquiry(service.title);
                  }
                }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative py-10 sm:py-14 md:py-16 lg:py-20 cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                  isHovered ? 'bg-white/[0.015]' : ''
                }`}
                aria-label={`${service.title} — ${service.description}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-10">
                  {/* Left Column: Numbered label and optional preview capsule */}
                  <div className="flex items-center md:items-start shrink-0">
                    {/* 
                      Distinctive treatment for UI/UX Design (Row 02):
                      Smoothly reveals liquid chrome capsule preview on hover
                    */}
                    {isUiUx && (
                      <div
                        className={`hidden md:block overflow-hidden rounded-xl h-14 md:h-16 lg:h-20 shrink-0 border border-white/20 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isHovered
                            ? 'w-24 lg:w-36 opacity-100 mr-5 lg:mr-7'
                            : 'w-0 opacity-0 mr-0'
                        }`}
                      >
                        <img
                          src="/assets/liquid-chrome-texture.jpg"
                          alt="UI/UX Interactive System Preview"
                          className="w-full h-full object-cover object-center grayscale contrast-125 scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <span className="font-mono text-xs sm:text-sm text-[#71717A] group-hover:text-white transition-colors duration-200 tracking-widest pt-1 md:pt-3 lg:pt-4">
                      {service.number}
                    </span>
                  </div>

                  {/* Center Column: Display title, description, and category line */}
                  <div className="flex-1 min-w-0 transition-transform duration-300 ease-out group-hover:translate-x-1 sm:group-hover:translate-x-2 md:group-hover:translate-x-3">
                    {/* Display Title */}
                    <h3 className="font-bold text-white tracking-[-0.03em] leading-[1.04] text-3xl sm:text-5xl md:text-6xl lg:text-[clamp(2.5rem,5.5vw,5.5rem)] transition-colors duration-200">
                      {service.title}
                    </h3>

                    {/* Concise Description directly below title */}
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#9A9AA6] font-normal leading-relaxed max-w-2xl">
                      {service.description}
                    </p>

                    {/* Category line directly below description */}
                    <div className="mt-3 sm:mt-4 text-xs sm:text-[13px] font-mono tracking-wider text-[#666672] group-hover:text-[#8E8E9A] uppercase transition-colors duration-200">
                      {service.categoryLine}
                    </div>
                  </div>

                  {/* Right Column: Understated Arrow Interaction Indicator */}
                  <div className="hidden md:flex items-center justify-end shrink-0 pt-2 lg:pt-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/10 group-hover:border-white/30 group-hover:bg-white/[0.06] flex items-center justify-center text-[#71717A] group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
