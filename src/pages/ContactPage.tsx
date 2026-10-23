import React, { useEffect, useState } from 'react';
import { PrismaticBeams } from '../components/contact/PrismaticBeams';
import { ProjectEnquiryForm } from '../components/contact/ProjectEnquiryForm';
import { ContactInfoPanel } from '../components/contact/ContactInfoPanel';

export interface ContactPageProps {
  initialService?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({ initialService }) => {
  const [serviceParam, setServiceParam] = useState<string | undefined>(initialService);

  // Scroll to top on page mount & parse URL search parameters
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('service');
      if (s) {
        setServiceParam(decodeURIComponent(s));
      }
    }
  }, []);

  return (
    <article className="relative w-full min-h-screen bg-[#000000] text-white overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
      {/* 
        ========================================================================
        1. CINEMATIC DIAGONAL RAINBOW LIGHT BEAMS BACKGROUND
        Soft, luminous chromatic dispersion streaks running behind the content
        ========================================================================
      */}
      <PrismaticBeams />

      {/* 
        ========================================================================
        2. FOREGROUND EDITORIAL CONTENT WRAPPER (~1,100px max width)
        ========================================================================
      */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto">
        {/* 
          HERO HEADLINE: "Let’s Connect"
          - Left-aligned above the form
          - "Let’s" in Outfit bold display typography
          - "Connect" in contrasting elegant Playfair Display italic serif
          - Exceptionally large scale spanning across the layout
        */}
        <header className="text-left mb-8 sm:mb-10 lg:mb-12 select-none">
          <h1 className="text-[clamp(3.8rem,9vw,8rem)] font-['Outfit',sans-serif] font-bold text-white tracking-tight leading-[0.92] drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)]">
            Let’s{' '}
            <span className="font-['Playfair_Display','Times_New_Roman',serif] italic font-normal tracking-normal text-white">
              Connect
            </span>
          </h1>
        </header>

        {/* 
          EXACT TWO-COLUMN DESKTOP LAYOUT (72–75% Form | 25–28% Contact Card)
          - Desktop: Main Form (~780px wide) + Contact Card (~260px wide)
          - Gap: ~16px-20px
          - Top aligned
          - Mobile: Stacked vertically with form first, followed by compact contact card
        */}
        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-5 w-full">
          {/* Main Dark Glass Project Enquiry Form (Dominant ~75%) */}
          <main className="w-full lg:flex-1 lg:max-w-[800px]">
            <ProjectEnquiryForm initialService={serviceParam} />
          </main>

          {/* Compact Right Contact Information Card (~25%, self-height) */}
          <aside className="w-full lg:w-[260px] shrink-0">
            <ContactInfoPanel />
          </aside>
        </div>
      </div>
    </article>
  );
};

export default ContactPage;
