import React from 'react';
import { collaborationPillars, clientOutcomesData } from '../data/trustData';
import { SectionHeader } from '../components/common/SectionHeader';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TrustOutcomesSection: React.FC = () => {
  return (
    <section
      id="outcomes"
      className="py-24 sm:py-36 px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1C1C22]"
    >
      <SectionHeader
        eyebrow="TRUST & COLLABORATION"
        heading="Good work creates lasting partnerships."
        description="We structure every partnership around mutual accountability, direct access to senior practitioners, and verified engineering standards."
      />

      {/* Collaboration Commitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {collaborationPillars.map((pillar, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 bg-[#0B0B0D] border border-[#1E1E24] rounded-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#E85A32]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-mono tracking-widest uppercase">
                  STANDARD 0{idx + 1}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-[#F4F4F2]">
                {pillar.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-[#8B8B8B] leading-relaxed">
                {pillar.detail}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#181820] text-[11px] font-mono text-[#71717A]">
              {pillar.benchmark}
            </div>
          </div>
        ))}
      </div>

      {/* Editorial Demonstration Engagements Strip */}
      <div className="mt-16 pt-12 border-t border-[#1C1C22]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-[#F4F4F2]">
              Engagement Models & Outcome Archetypes
            </h3>
            <p className="text-xs text-[#8B8B8B] font-mono mt-1">
              DEMONSTRATION CASE STRUCTURES · READY FOR VERIFIED AUDIT DATA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clientOutcomesData.map((outcome, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#0E0E12] border border-[#1E1E24] rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8B8B8B] mb-3">
                  <span className="text-[#E85A32]">{outcome.industry}</span>
                  <span className="text-[10px] text-[#52525B]">SAMPLE ARCHETYPE</span>
                </div>

                <div className="text-base font-semibold text-[#F4F4F2] mb-1">
                  {outcome.engagementType}
                </div>

                <div className="text-xs text-[#A1A1AA] font-mono mb-4">
                  {outcome.focusArea}
                </div>

                <p className="text-xs sm:text-sm text-[#8B8B8B] leading-relaxed">
                  {outcome.deliverableOutcome}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C1C24] flex items-center gap-1.5 text-[11px] font-mono text-[#71717A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#534B82]" />
                <span>Structured for verifiable client attribution</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
