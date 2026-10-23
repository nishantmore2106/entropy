import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StudioManifestoSectionProps {
  onOpenInquiry: () => void;
}

export const StudioManifestoSection: React.FC<StudioManifestoSectionProps> = ({
  onOpenInquiry,
}) => {
  const manifestoPillars = [
    {
      title: 'Strategy precedes execution.',
      text: 'Visual craft without positioning is decoration. We diagnose the market, clarify the core value proposition, and establish the intent before committing to a single design stroke.',
    },
    {
      title: 'A strong brand must possess clear purpose.',
      text: 'Identity is not just a mark or a color swatch; it is an enduring operating system that unites narrative, typography, and customer experience into a singular recognizable voice.',
    },
    {
      title: 'Digital experiences should be intuitive, not ornamental.',
      text: 'We design software and websites around human cognitive flow. Frictionless navigation, legible hierarchy, and ergonomic responsive patterns take priority over superficial visual gimmicks.',
    },
    {
      title: 'Technology must perform as rigorously as it looks.',
      text: 'Stunning aesthetics cannot compensate for sluggish frame rates or fragile codebases. Our engineering standard is production-grade: sub-second latency, zero runtime bloat, and resilient architectures.',
    },
    {
      title: 'Every decision must serve the overarching idea.',
      text: 'From micro-interactions to database schemas, every technical and artistic choice is held accountable to the central strategic objective.',
    },
  ];

  return (
    <section
      id="manifesto"
      className="py-24 sm:py-36 px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C22]"
    >
      <div className="flex items-center gap-2 mb-6 text-xs tracking-widest font-mono text-[#8B8B8B] uppercase">
        <span>STUDIO MANIFESTO</span>
        <span className="w-8 h-[1px] bg-[#27272A]" aria-hidden="true" />
      </div>

      {/* Hero Typographic Statement */}
      <div className="max-w-5xl">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[#F4F4F2] leading-[1.12] text-balance">
          Good ideas deserve more than good looks.
        </h2>
        <p className="mt-8 text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-3xl font-light">
          ENTROPY is an independent creative technology practice operating at the confluence of brand strategy, visual systems, and bespoke software engineering. We don’t separate thinking from making.
        </p>
      </div>

      {/* Editorial Split Grid */}
      <div className="mt-16 pt-12 border-t border-[#1C1C22] grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[#E85A32]">
            OUR PHILOSOPHICAL FOUNDATION
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold font-display text-[#F4F4F2] text-balance">
            Where brand identity converges with precision digital engineering.
          </h3>
          <p className="text-sm text-[#8B8B8B] leading-relaxed">
            Most digital agencies choose between high-concept branding without technical depth, or engineering shops without aesthetic discernment. ENTROPY was founded to eliminate that false compromise.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenInquiry}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F4F4F2] hover:text-[#E85A32] transition-colors group cursor-pointer"
            >
              <span>Partner With Our Studio</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* 5 Manifesto Pillars with Editorial Numbering */}
        <div className="lg:col-span-7 divide-y divide-[#1C1C22]">
          {manifestoPillars.map((pillar, idx) => (
            <div key={idx} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                <span className="text-xs font-mono text-[#E85A32] tabular-nums shrink-0 mt-0.5">
                  0{idx + 1}.
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-[#F4F4F2]">
                    {pillar.title}
                  </h4>
                  <p className="mt-1.5 text-sm text-[#8B8B8B] leading-relaxed">
                    {pillar.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
