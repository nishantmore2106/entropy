import React, { useEffect } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { LayeredHeadingReveal } from '../components/common/LayeredHeadingReveal';
import { GetStartedButton } from '../components/ui/GetStartedButton';

interface AboutUsPageProps {
  onOpenInquiry?: () => void;
}

interface ValueItem {
  id: string;
  title: string;
  description: string;
}

const VALUES: ValueItem[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    description: 'We simplify the complex and make every decision easier to understand.',
  },
  {
    id: 'precision',
    title: 'Precision',
    description: 'We pay attention to the details that shape the final experience.',
  },
  {
    id: 'purpose',
    title: 'Purpose',
    description: 'Every project begins with a reason, a direction, and a clear objective.',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: 'We create cohesive identities and digital experiences across every touchpoint.',
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'We build experiences that are responsive, considered, and designed to work reliably.',
  },
];

/**
 * ENTROPY — About Us Editorial Profile Page
 * Minimal black canvas inspired by high-end studio portfolio editorials:
 * - Layered heading reveal: 'About us' slips naturally beneath the following content layer on scroll
 * - Clean typography without arbitrary decorative badges, borders, or lines
 * - Focused studio introduction and philosophy
 * - Alternating 5-value vertical timeline
 * - Standardized closing statement connecting into global footer
 */
export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onOpenInquiry }) => {
  // Ensure smooth scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <article className="relative w-full bg-[#000000] text-[#F4F4F2] overflow-x-hidden select-none">
      {/* 
        ========================================================================
        1. LAYERED SCROLL-LINKED HEADING REVEAL (z-0)
        ========================================================================
      */}
      <LayeredHeadingReveal title="About us" />

      {/* 
        ========================================================================
        2. FOREGROUND CONTENT SURFACE (z-10, bg-[#000000])
        Passes visually in front of 'About us', slowly concealing it from bottom up
        ========================================================================
      */}
      <div className="relative z-10 w-full bg-[#000000]">
        {/* STUDIO INTRODUCTION */}
        <section
          aria-label="Studio Introduction"
          className="relative max-w-3xl mx-auto px-6 sm:px-8 text-center pt-12 sm:pt-16 pb-16 sm:pb-24"
        >
          <ScrollReveal yOffset={24}>
            <div className="relative">

              {/* Main copy */}
              <p className="text-xl sm:text-2xl md:text-[1.75rem] text-white/95 font-light leading-relaxed sm:leading-[1.4] tracking-tight mb-6 sm:mb-8 text-balance">
                ENTROPY is an independent creative technology studio bringing brand, design, and technology together to create purposeful digital experiences.
              </p>

              {/* Supporting paragraph */}
              <p className="text-sm sm:text-base md:text-lg text-[#A1A1A6] font-normal leading-relaxed max-w-xl mx-auto">
                We turn ideas into distinctive identities and thoughtful websites, guided by strategy and built with intention.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* BRAND PRINCIPLES / PHILOSOPHY */}
        <section
          aria-label="Our Philosophy"
          className="relative max-w-2xl mx-auto px-6 sm:px-8 text-center py-16 sm:py-24"
        >
          <ScrollReveal yOffset={24}>
            <h2 className="font-['Rigter',sans-serif] text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-6 select-none">
              Our philosophy
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl text-[#E4E4E7] font-normal leading-relaxed sm:leading-[1.5] text-balance max-w-xl mx-auto">
              We believe good work begins with clear thinking. Every decision should have a purpose, every detail should feel considered, and every experience should work as beautifully as it looks.
            </p>
          </ScrollReveal>
        </section>

        {/* OUR VALUES — VERTICAL TIMELINE */}
        <section
          aria-label="Our Values"
          className="relative max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24"
        >
          <ScrollReveal yOffset={24}>
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <h2 className="font-['Rigter',sans-serif] text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none select-none">
                Our values
              </h2>
            </div>
          </ScrollReveal>

          {/* Timeline Container */}
          <div className="relative">
            {/* Mobile line (left aligned) */}
            <div
              className="md:hidden absolute left-3 sm:left-4 top-2 bottom-2 w-[1px] bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              aria-hidden="true"
            />
            {/* Desktop line (strictly centered) */}
            <div
              className="hidden md:block absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              aria-hidden="true"
            />

            <div className="flex flex-col space-y-12 sm:space-y-16 md:space-y-24">
              {VALUES.map((val, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <div key={val.id} className="relative group">
                    <ScrollReveal yOffset={16} delay={idx * 0.05}>
                      {/* DESKTOP LAYOUT (>= md) */}
                      <div className="hidden md:grid md:grid-cols-2 md:gap-16 items-center">
                        {isEven ? (
                          <>
                            <div className="text-right pr-6 relative">
                              <h3 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl text-white tracking-tight mb-2">
                                {val.title}
                              </h3>
                              <p className="text-sm sm:text-[15px] text-[#A1A1A6] font-normal leading-relaxed max-w-md ml-auto">
                                {val.description}
                              </p>

                              <div
                                className="absolute top-1/2 -right-8 w-8 h-[1px] bg-white/20 group-hover:bg-white/40 transition-colors"
                                aria-hidden="true"
                              />
                            </div>
                            <div aria-hidden="true" />
                          </>
                        ) : (
                          <>
                            <div aria-hidden="true" />
                            <div className="text-left pl-6 relative">
                              <div
                                className="absolute top-1/2 -left-8 w-8 h-[1px] bg-white/20 group-hover:bg-white/40 transition-colors"
                                aria-hidden="true"
                              />

                              <h3 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl text-white tracking-tight mb-2">
                                {val.title}
                              </h3>
                              <p className="text-sm sm:text-[15px] text-[#A1A1A6] font-normal leading-relaxed max-w-md">
                                {val.description}
                              </p>
                            </div>
                          </>
                        )}

                        {/* Center Node Dot */}
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 border border-black group-hover:bg-white transition-colors"
                          aria-hidden="true"
                        />
                      </div>

                      {/* MOBILE LAYOUT (< md) */}
                      <div className="md:hidden relative pl-10 sm:pl-12">
                        <div
                          className="absolute left-[9px] sm:left-[13px] top-3 w-2 h-2 rounded-full bg-white/60 border border-black"
                          aria-hidden="true"
                        />
                        <div
                          className="absolute left-3 sm:left-4 top-4 w-5 sm:w-6 h-[1px] bg-white/20"
                          aria-hidden="true"
                        />

                        <h3 className="font-['Rigter',sans-serif] text-xl sm:text-2xl text-white tracking-tight mb-1.5">
                          {val.title}
                        </h3>
                        <p className="text-sm text-[#A1A1A6] font-normal leading-relaxed">
                          {val.description}
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLOSING BRAND STATEMENT */}
        <section
          aria-label="Closing Brand Statement"
          className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-6 sm:px-8 max-w-6xl mx-auto text-center"
        >
          <ScrollReveal yOffset={24}>
            <h2 className="font-['Rigter',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] text-white tracking-tight leading-[1.08] mb-8 sm:mb-10 text-balance select-none">
              Create with intention.<br />
              Build with purpose.
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GetStartedButton
                to="/works"
                variant="secondary"
                defaultText="See our work"
                hoverText="Explore"
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto min-w-[190px]"
              />

              <GetStartedButton
                onClick={onOpenInquiry}
                variant="primary"
                defaultText="Start a project"
                hoverText="Let's build"
                icon={<ArrowUpRight className="w-4 h-4" />}
                className="w-full sm:w-auto min-w-[190px]"
              />
            </div>
          </ScrollReveal>
        </section>
      </div>
    </article>
  );
};

export default AboutUsPage;
