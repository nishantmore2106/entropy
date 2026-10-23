import React from 'react';
import { FAQ9, defaultEntropyFaqs } from '../components/ui/faq-9';
import { ScrollReveal } from '../components/common/ScrollReveal';

interface FAQSectionProps {
  onOpenInquiry?: (serviceName?: string) => void;
  className?: string;
}

/**
 * ENTROPY — Frequently Asked Questions Section
 * Positioned immediately after Our Approach and before Pricing.
 * Powered by React Bits Pro FAQ 9 with native 2-column grid and sticky contact panel.
 */
export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  return (
    <div className={`relative w-full bg-[#000000] pt-20 sm:pt-28 lg:pt-32 pb-24 sm:pb-32 lg:pb-36 ${className}`}>
      {/* Subtle top section blend from Our Approach */}
      <div
        className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      <ScrollReveal yOffset={24}>
        <FAQ9
          heading="Frequently asked questions"
          tag="Common inquiries"
          faqs={defaultEntropyFaqs}
          contactPanel={{
            title: 'Have a project in mind?',
            description: "Tell us what you're building. Let's find the right direction.",
            primaryCtaText: 'Start a project',
            onPrimaryCta: () => onOpenInquiry && onOpenInquiry(),
            secondaryLinkText: 'Explore our work',
            secondaryLinkHref: '#selected-work',
          }}
        />
      </ScrollReveal>


    </div>
  );
};

export default FAQSection;
