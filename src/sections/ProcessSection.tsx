import React from 'react';
import { HowItWorks7 } from '../components/ui/how-it-works-7';

export const ProcessSection: React.FC = () => {
  return (
    <section
      id="process"
      aria-label="How We Work — Our Approach"
      className="relative w-full pt-20 sm:pt-28 pb-24 sm:pb-32 bg-[#000000] border-t border-[#1C1C22]/80 overflow-hidden"
    >
      {/* Subtle background ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(191,215,242,0.04),transparent_70%)] pointer-events-none blur-3xl"
        aria-hidden="true"
      />

      {/* Native How It Works 7 Block */}
      <HowItWorks7
        sectionTag="05 / OUR APPROACH"
        heading="How We Work"
        subheading="Strategy before execution. Intention in every detail."
        imageSrc="/assets/about/chrome-form.jpg"
        imageAlt="Sculptural reflective metallic structure embodying design and technology"
      />
    </section>
  );
};

export default ProcessSection;
