import React from 'react';
import { approachData } from '../data/approachData';
import { SectionHeader } from '../components/common/SectionHeader';

export const WhyEntropySection: React.FC = () => {
  return (
    <section
      id="approach"
      className="py-24 sm:py-36 px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C22]"
    >
      <SectionHeader
        eyebrow="THE ENTROPY APPROACH"
        heading="Designed with intent. Built with purpose."
        description="We eliminate the organizational friction between branding agencies and software developers by operating as an integrated creative engineering unit."
      />

      {/* 4 Differentiator Pillars in Asymmetrical 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-16">
        {approachData.map((pillar) => (
          <div
            key={pillar.number}
            className="p-8 sm:p-10 bg-[#0B0B0D] border border-[#1E1E24] hover:border-[#2F2F3B] rounded-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-[#E85A32] tabular-nums">
                  PILLAR // 0{pillar.number}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#1F1F28] group-hover:bg-[#E85A32] transition-colors" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-[#F4F4F2] group-hover:text-white transition-colors">
                {pillar.title}
              </h3>

              <p className="mt-3 text-sm sm:text-base font-medium text-[#D4D4D8] leading-relaxed">
                {pillar.lead}
              </p>

              <p className="mt-4 text-xs sm:text-sm text-[#8B8B8B] leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1A1A22] text-xs font-mono text-[#71717A] flex items-center gap-2">
              <span className="text-[#E85A32]">↳</span>
              <span>{pillar.contrastConcept}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
