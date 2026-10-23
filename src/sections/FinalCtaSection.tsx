import React from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { GetStartedButton } from '../components/ui/GetStartedButton';
import { ScrollReveal } from '../components/common/ScrollReveal';

interface FinalCtaSectionProps {
  onOpenInquiry: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenInquiry }) => {
  return (
    <section
      id="contact"
      className="relative pt-24 pb-32 sm:pt-36 sm:pb-40 px-6 lg:px-8 max-w-7xl mx-auto"
      aria-label="Contact ENTROPY"
    >
      <ScrollReveal yOffset={24}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-[#F4F4F2] leading-[1.08] text-balance">
            Have an idea worth building?
          </h2>

          {/* Action Buttons — Standardized with GetStartedButton Pearl Styling */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GetStartedButton
              onClick={onOpenInquiry}
              defaultText="Start a project"
              hoverText="Let's build"
              icon={<ArrowUpRight className="w-4 h-4" />}
              className="w-full sm:w-auto min-w-[190px]"
            />

            <GetStartedButton
              href={`mailto:${siteConfig.contactEmail}?subject=ENTROPY%20Studio%20Inquiry`}
              variant="secondary"
              defaultText="Email ENTROPY"
              hoverText="Say hello"
              icon={<Mail className="w-4 h-4" />}
              className="w-full sm:w-auto min-w-[190px]"
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default FinalCtaSection;
