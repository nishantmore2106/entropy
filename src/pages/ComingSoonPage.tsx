import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GetStartedButton } from '../components/ui/GetStartedButton';

interface ComingSoonPageProps {
  pageTitle?: string;
  badge?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  pageTitle,
  badge = 'In development',
}) => {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-[#080808] text-[#F5F5F7] overflow-hidden">
      {/* Subtle background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#3b82f6]/[0.03] to-[#BFD7F2]/[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        {/* Subtle pill badge — Natural title case */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono tracking-wider text-[#8E8E93] mb-6 sm:mb-8">
          <Sparkles className="w-3 h-3 text-[#93c5fd]" />
          <span>{pageTitle ? `${pageTitle} · ${badge}` : badge}</span>
        </div>

        {/* Heading — Rigter Font, Natural Title Case */}
        <h1 className="font-['Rigter',sans-serif] text-5xl sm:text-7xl md:text-8xl text-white tracking-tight leading-none mb-5 sm:mb-6 select-none">
          Coming soon
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-[#A1A1A6] font-normal leading-relaxed max-w-md mb-8 sm:mb-10">
          We're shaping this experience. Check back soon.
        </p>

        {/* Standardized GetStartedButton secondary action */}
        <GetStartedButton
          to="/"
          variant="secondary"
          defaultText="Back to home"
          hoverText="Return home"
          icon={<ArrowLeft className="w-4 h-4" />}
          className="min-w-[170px]"
        />
      </div>
    </div>
  );
};

export default ComingSoonPage;
