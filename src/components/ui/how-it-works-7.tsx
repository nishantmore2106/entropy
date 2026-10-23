import React from 'react';
import { Search, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HowItWorks7Step {
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface HowItWorks7Props {
  sectionTag?: string;
  heading?: string;
  subheading?: string;
  steps?: HowItWorks7Step[];
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

const DEFAULT_STEPS: HowItWorks7Step[] = [
  {
    number: '01',
    tag: 'UNDERSTAND',
    title: 'Discover',
    description:
      'We understand your business, audience, objectives, and challenges before defining the direction.',
    icon: <Search className="w-4 h-4 text-[#BFD7F2]" />,
  },
  {
    number: '02',
    tag: 'STRATEGISE',
    title: 'Define',
    description:
      'We establish the strategy, priorities, and creative direction that give the project a clear purpose.',
    icon: <Compass className="w-4 h-4 text-[#BFD7F2]" />,
  },
  {
    number: '03',
    tag: 'DESIGN & BUILD',
    title: 'Create',
    description:
      'We transform strategy into distinctive identities, thoughtful interfaces, and purposeful digital experiences.',
    icon: <Sparkles className="w-4 h-4 text-[#BFD7F2]" />,
  },
  {
    number: '04',
    tag: 'PERFECT & DELIVER',
    title: 'Refine & Deliver',
    description:
      'We test, refine, and polish every detail before delivering the final work, ready for its intended use.',
    icon: <CheckCircle2 className="w-4 h-4 text-[#BFD7F2]" />,
  },
];

export const HowItWorks7: React.FC<HowItWorks7Props> = ({
  sectionTag = '05 / OUR APPROACH',
  heading = 'How We Work',
  subheading = 'Strategy before execution. Intention in every detail.',
  steps = DEFAULT_STEPS,
  imageSrc = '/assets/about/chrome-form.jpg',
  imageAlt = 'Sculptural metallic chrome form reflecting creative technology',
  className,
}) => {
  const step1 = steps[0] || DEFAULT_STEPS[0];
  const step2 = steps[1] || DEFAULT_STEPS[1];
  const step3 = steps[2] || DEFAULT_STEPS[2];
  const step4 = steps[3] || DEFAULT_STEPS[3];

  const renderCard = (step: HowItWorks7Step, alignment: 'left' | 'right' = 'left') => (
    <div
      key={step.number}
      className={cn(
        'group relative p-6 sm:p-8 rounded-2xl bg-[#0D0D12]/80 hover:bg-[#12121A]/95',
        'border border-[#1E1E26] hover:border-[#BFD7F2]/40',
        'transition-all duration-300 shadow-xl flex flex-col justify-between',
        'hover:-translate-y-1',
        alignment === 'left' ? 'text-left' : 'text-left lg:text-left'
      )}
    >
      {/* Top Header inside Card */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl font-serif italic text-white/40 group-hover:text-white transition-colors">
            {step.number}
          </span>
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[#BFD7F2] bg-[#BFD7F2]/10 border border-[#BFD7F2]/20 px-2.5 py-1 rounded-full">
            {step.tag}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#181822] border border-[#262634] flex items-center justify-center shrink-0 group-hover:border-[#BFD7F2]/50 group-hover:bg-[#1C2030] transition-colors">
          {step.icon}
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight group-hover:text-[#BFD7F2] transition-colors">
          {step.title}
        </h3>
        <p className="mt-2.5 text-sm sm:text-base text-[#94A3B8] font-sans leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Subtle bottom decorative line */}
      <div className="mt-6 pt-3 border-t border-[#1C1C24]/80 flex items-center justify-between text-xs text-[#52525B]">
        <span className="tracking-widest uppercase text-[10px]">STAGE {step.number}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#BFD7F2]/40 group-hover:bg-[#BFD7F2] transition-colors" />
      </div>
    </div>
  );

  return (
    <div className={cn('relative w-full max-w-7xl mx-auto px-6 lg:px-8', className)}>
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
        {sectionTag && (
          <p className="text-xs sm:text-[13px] tracking-[0.28em] font-sans font-semibold text-[#BFD7F2] uppercase mb-3">
            {sectionTag}
          </p>
        )}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4">
          {heading}
        </h2>
        {subheading && (
          <p className="text-base sm:text-lg text-[#94A3B8] font-sans font-normal leading-relaxed max-w-xl mx-auto">
            {subheading}
          </p>
        )}
      </div>

      {/* Desktop Native 3-Column Layout: Left (01, 03) - Center (Arched Image) - Right (02, 04) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Steps 01 and 03 */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-10 xl:space-y-16">
          {renderCard(step1, 'left')}
          {renderCard(step3, 'left')}
        </div>

        {/* Center Column: The Central Arched Image */}
        <div className="lg:col-span-4 flex justify-center items-center">
          <div className="relative w-full max-w-[340px] xl:max-w-[380px] aspect-[9/15] rounded-t-full overflow-hidden border border-[#22222E] bg-[#0A0A0E] shadow-[0_0_80px_rgba(191,215,242,0.08)] group">
            {/* Ambient inner rim glow */}
            <div className="absolute inset-0 rounded-t-full pointer-events-none ring-1 ring-inset ring-white/10 z-20" />
            
            {/* The Sculptural Arched Image */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle atmospheric vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80 pointer-events-none z-10" />

            {/* Arch Center Accent Marker */}
            <div className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center z-20 text-center px-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFD7F2] mb-2 animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#BFD7F2]/80 uppercase">
                ENTROPY DISCIPLINE
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Steps 02 and 04 */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-10 xl:space-y-16">
          {renderCard(step2, 'right')}
          {renderCard(step4, 'right')}
        </div>
      </div>

      {/* Mobile & Tablet Responsive Layout */}
      <div className="block lg:hidden space-y-8">
        {/* Central Arched Image for Mobile/Tablet */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/14] rounded-t-full overflow-hidden border border-[#22222E] bg-[#0A0A0E] shadow-[0_0_60px_rgba(191,215,242,0.06)]">
            <div className="absolute inset-0 rounded-t-full pointer-events-none ring-1 ring-inset ring-white/10 z-20" />
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80 pointer-events-none z-10" />
            <div className="absolute bottom-5 inset-x-0 flex flex-col items-center justify-center z-20 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFD7F2] mb-1.5" />
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#BFD7F2]/80 uppercase">
                ENTROPY DISCIPLINE
              </span>
            </div>
          </div>
        </div>

        {/* 4 Process Cards in Logical Order: 01 -> 02 -> 03 -> 04 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {renderCard(step1, 'left')}
          {renderCard(step2, 'left')}
          {renderCard(step3, 'left')}
          {renderCard(step4, 'left')}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks7;
