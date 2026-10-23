import React from 'react';
import {
  Fingerprint,
  Compass,
  Shapes,
  PanelsTopLeft,
  Monitor,
  Code2,
  ShoppingCart,
  MousePointer2,
  ArrowUpRight,
} from 'lucide-react';
import { servicesData, ServiceItem } from '../data/servicesData';
import { Link } from '../router/Router';
import GlareHover from '../components/ui/GlareHover';
import Galaxy from '../components/ui/Galaxy';
import { GetStartedButton } from '../components/ui/GetStartedButton';
import { ScrollReveal } from '../components/common/ScrollReveal';

interface ServicesDirectorySectionProps {
  onOpenInquiry?: (serviceName?: string) => void;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  Compass,
  Shapes,
  PanelsTopLeft,
  Monitor,
  Code2,
  ShoppingCart,
  MousePointer2,
};

// Filter strictly the 8 homepage services in designated order
const HOMEPAGE_SERVICE_IDS = [
  'brand-identity',
  'brand-strategy',
  'logo-design',
  'ui-ux-design',
  'website-design',
  'website-development',
  'ecommerce-development',
  'landing-pages',
];

export const ServicesDirectorySection: React.FC<ServicesDirectorySectionProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  const homepageServices = HOMEPAGE_SERVICE_IDS
    .map((id) => servicesData.find((s) => s.id === id))
    .filter((s): s is ServiceItem => Boolean(s));

  return (
    <section
      id="services"
      className={`relative w-full bg-[#000000] pt-20 sm:pt-28 lg:pt-36 pb-24 sm:pb-32 lg:pb-36 text-[#F5F5F7] overflow-hidden ${className}`}
      aria-label="What we do — ENTROPY Services Directory"
    >
      {/* Soft top gradient blend from previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-24 sm:h-36 bg-gradient-to-b from-[#000000] via-[#000000]/75 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      <ScrollReveal yOffset={24}>
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Section Heading Area: Concise minimal header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 pb-10 sm:pb-14 border-b border-[#1C1C22]">
            <div className="max-w-2xl">
              {/* Main Heading — Natural title case with Rigter font */}
              <h2 className="font-['Rigter',sans-serif] text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.08]">
                What we do
              </h2>
            </div>

            {/* Right Action Links */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2 lg:pt-0">
              <GetStartedButton
                onClick={() => onOpenInquiry?.()}
                defaultText="Start a project"
                hoverText="Let's talk"
                icon={<ArrowUpRight className="w-4 h-4" />}
                className="text-xs"
              />
            </div>
          </div>

          {/* 
            Balanced 4-Column x 2-Row Service Directory Grid (8 items) with GlareHover:
            - 4 columns on desktop, 2 on tablet, 1 or 2 on mobile
            - Consistent graphite borders (#202026) and 14px corner radius
            - White monochrome icons and natural title case labels
            - Understated hover sweep and subtle brightness transition
          */}
          <div
            id="services-grid"
            className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-10 sm:mt-12"
          >
            {homepageServices.map((service) => {
              const IconComponent = ICON_MAP[service.iconName] || Monitor;

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label={`Learn more about ${service.name}`}
                >
                  <GlareHover
                    width="100%"
                    height="100%"
                    background="#000000"
                    borderRadius="14px"
                    borderColor="#202026"
                    mode="hover"
                    variant="streak"
                    glareColor="#ffffff"
                    glareOpacity={0.28}
                    glareSize={30}
                    softness={0.65}
                    glareAngle={-45}
                    blendMode="screen"
                    rimGlint
                    transitionDuration={600}
                    className="service-glare-card w-full h-full transition-all duration-300 group-hover:border-[#383846]"
                  >
                    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-7 lg:p-8 min-h-[175px] sm:min-h-[195px] lg:min-h-[210px] w-full h-full select-none">
                      {/* Centered Monochrome Icon */}
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-[#9A9AA4] group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-300 mb-4 sm:mb-4.5">
                        <IconComponent
                          className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Service Name — Natural Title Case */}
                      <h3 className="text-sm sm:text-base font-medium text-[#E5E5EA] group-hover:text-white transition-colors duration-300 tracking-tight leading-snug max-w-[200px]">
                        {service.name}
                      </h3>
                    </div>
                  </GlareHover>
                </Link>
              );
            })}
          </div>

          {/* 
            WIDE CINEMATIC FEATURE CARD WITH GALAXY BACKGROUND
            - Sits immediately beneath the 8-card grid
            - Responsive height (~280–340px on desktop)
            - 14px rounded corners matching the service cards
            - Pitch-black, space-like surface with subtle monochrome stars
            - Interactive mouse repulsion & click warp
            - Rigter 2-line heading, concise supporting text, and GetStartedButton
          */}
          <div className="mt-6 sm:mt-8 lg:mt-9 w-full relative rounded-2xl overflow-hidden bg-[#000000] border border-[#202026] min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Galaxy Animated Background Layer */}
            <div
              className="absolute inset-0 z-0 overflow-hidden pointer-events-auto"
              aria-hidden="true"
            >
              <Galaxy
                density={1}
                glowIntensity={0.3}
                flareIntensity={1}
                starSpeed={0.5}
                mouseRepulsion
                clickWarp
                className="w-full h-full"
              />
            </div>

            {/* Subtle Gradient Overlay for Text Contrast */}
            <div
              className="absolute inset-0 z-[1] bg-gradient-to-r from-black/85 via-black/60 to-black/20 pointer-events-none"
              aria-hidden="true"
            />

            {/* Feature Card Content Layer */}
            <div className="relative z-10 w-full px-6 sm:px-9 lg:px-11 py-8 sm:py-10 flex flex-col items-start justify-center text-left pointer-events-none">
              <h3 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl lg:text-[2.25rem] text-white tracking-tight leading-[1.12] mb-3.5 select-none">
                Platform flexibility.<br />
                Design consistency.
              </h3>

              <p className="text-sm sm:text-base text-[#A1A1A6] font-normal leading-relaxed max-w-[560px] mb-6">
                No matter the platform, our design language stays consistent, refined, responsive, and built to perform.
              </p>

              <div className="pointer-events-auto">
                <GetStartedButton
                  to="/works"
                  defaultText="See our work"
                  hoverText="Selected works"
                  className="min-w-[150px]"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ServicesDirectorySection;
