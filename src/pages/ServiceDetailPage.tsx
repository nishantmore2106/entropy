import React from 'react';
import {
  ArrowLeft,
  Check,
  ArrowUpRight,
  Fingerprint,
  Compass,
  Shapes,
  PanelsTopLeft,
  Monitor,
  Code2,
  ShoppingCart,
  MousePointer2,
  AudioLines,
  Layers3,
} from 'lucide-react';
import { ServiceItem, getServiceBySlug } from '../data/servicesData';
import { spiralProjectsData, SpiralProjectItem } from '../data/spiralProjectsData';
import { Link } from '../router/Router';
import FluxLines from '../components/ui/FluxLines';
import GlareHover from '../components/ui/GlareHover';
import { GetStartedButton } from '../components/ui/GetStartedButton';

const ICON_MAP = {
  Fingerprint,
  Compass,
  Shapes,
  PanelsTopLeft,
  Monitor,
  Code2,
  ShoppingCart,
  MousePointer2,
  AudioLines,
  Layers3,
};

interface ServiceDetailPageProps {
  service: ServiceItem;
  onOpenInquiry?: (serviceName?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onOpenInquiry,
}) => {
  const IconComponent = ICON_MAP[service.iconName] || Monitor;

  // Scroll to top whenever the service slug changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [service.slug]);

  // Retrieve genuine, verified projects associated with this service
  const matchingProjects: SpiralProjectItem[] = (service.projectIds || [])
    .map((id) => spiralProjectsData.find((p) => p.id === id))
    .filter((p): p is SpiralProjectItem => Boolean(p));

  // Retrieve related services
  const relatedServices = service.relatedSlugs
    .map((slug) => getServiceBySlug(slug))
    .filter((s): s is ServiceItem => Boolean(s));

  return (
    <article className="relative min-h-screen bg-[#000000] text-[#F5F5F7] pt-24 sm:pt-32 pb-24 sm:pb-36 overflow-hidden">
      {/* 
        Layer 1: Official React Bits FluxLines Background
        Spans the entire viewport behind all content on the service detail page.
        Pure pitch-black base (#000000) with flowing white-and-blue flux lines.
      */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <FluxLines
          colors={['#ffffff', '#3b82f6', '#ffffff']}
          glow={2}
          rimWidth={0.2}
          lineWidth={1}
          flowDirection="down"
          mouseInteraction
          clickSwirl
          backgroundColor="#000000"
          className="w-full h-full"
        />
        {/* Subtle dark gradient overlay to ensure text contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/30 via-transparent to-[#000000]/60 pointer-events-none" />
      </div>

      {/* Layer 2: Page Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Compact Breadcrumb / Back Link */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/#services"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#8E8E93] hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>All services</span>
          </Link>
        </div>

        {/* 
          Two-Column Section Header & Introduction:
          - Left: Main heading, intro statement, and editorial paragraphs
          - Right: Restrained bordered 'What's included' panel
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-16 sm:pb-24 border-b border-[#1C1C24]/80">
          {/* Left Column: Heading & Introduction */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <span className="text-xs font-mono tracking-wider text-[#8E8E93]">
                {service.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
            </div>

            {/* Main Page Heading — Natural Title Case with Rigter font */}
            <h1 className="font-['Rigter',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] text-white tracking-tight leading-[1.05] mb-6 sm:mb-8">
              {service.mainHeading}
            </h1>

            {/* Short introductory statement */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#E5E5EA] font-normal leading-relaxed mb-5 sm:mb-6">
              {service.introduction}
            </p>

            {/* Concise overview paragraph */}
            {service.longDescription && service.longDescription.length > 0 && (
              <p className="text-sm sm:text-base text-[#A1A1A6] leading-relaxed font-normal">
                {service.longDescription[0]}
              </p>
            )}
          </div>

          {/* Right Column: Restrained What's Included Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 sm:p-8 rounded-xl bg-[#09090D]/90 border border-[#20202A] backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3 pb-5 border-b border-[#1A1A24] mb-6">
                <div className="w-8 h-8 rounded-md bg-white/[0.05] flex items-center justify-center text-white">
                  <IconComponent className="w-4 h-4 stroke-[1.8]" />
                </div>
                <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  What's included
                </h2>
              </div>

              {/* Inclusions List */}
              <ul className="space-y-3.5 mb-7" aria-label="Service inclusions">
                {service.inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-[#D1D1D6]">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 text-[#93c5fd]">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </span>
                    <span className="leading-snug">{inclusion}</span>
                  </li>
                ))}
              </ul>

              {/* Standardized GetStartedButton */}
              <GetStartedButton
                onClick={() => onOpenInquiry?.(service.name)}
                defaultText="Start a project"
                hoverText="Let's build"
                icon={<ArrowUpRight className="w-4 h-4" />}
                className="w-full"
              />

              <p className="text-[11px] text-[#71717A] text-center mt-3 font-normal">
                Capabilities tailored to the requirements of your project.
              </p>
            </div>
          </div>
        </div>

        {/* 
          Section 2: Problem Solved & Suitable For (Two-Column Card Grid)
        */}
        <div className="py-16 sm:py-24 border-b border-[#1C1C24]/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="p-8 rounded-xl bg-[#08080C] border border-[#1A1A24]">
              <span className="text-xs font-mono tracking-wider text-[#38bdf8] mb-3 block">
                01 / Problems we address
              </span>
              <h2 className="text-xl sm:text-2xl font-['Rigter',sans-serif] text-white mb-4">
                What this solves for your business
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1A6] leading-relaxed">
                {service.problemSolved}
              </p>
            </div>

            <div className="p-8 rounded-xl bg-[#08080C] border border-[#1A1A24]">
              <span className="text-xs font-mono tracking-wider text-[#38bdf8] mb-3 block">
                02 / Suitability & Fit
              </span>
              <h2 className="text-xl sm:text-2xl font-['Rigter',sans-serif] text-white mb-4">
                Who this service is tailored for
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1A6] leading-relaxed">
                {service.suitableFor}
              </p>
            </div>
          </div>
        </div>

        {/* 
          Section 3: Four-Step Process Architecture
        */}
        {service.processSteps && service.processSteps.length > 0 && (
          <div className="py-16 sm:py-24 border-b border-[#1C1C24]/80">
            <div className="mb-12">
              <span className="text-xs font-mono tracking-wider text-[#8E8E93] mb-2 block">
                Methodology
              </span>
              <h2 className="font-['Rigter',sans-serif] text-3xl sm:text-4xl text-white tracking-tight">
                Our structured delivery process
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.processSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-6 rounded-xl bg-[#09090D] border border-[#1C1C26] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] font-bold tracking-wider mb-4 block">
                      Phase {step.step}
                    </span>
                    <h3 className="text-lg font-medium text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Scope, Timelines & Pricing Factors */}
            <div className="mt-8 p-6 rounded-xl bg-[#07070A] border border-[#181820] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="max-w-3xl">
                <span className="text-xs font-mono text-[#8E8E93] block mb-1">
                  Scope &amp; timeline factors
                </span>
                <p className="text-xs sm:text-sm text-[#A1A1A6]">
                  {service.pricingFactors}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenInquiry?.(service.name)}
                className="shrink-0 text-xs font-medium text-[#38bdf8] hover:text-white transition-colors underline underline-offset-4"
              >
                Request tailored proposal →
              </button>
            </div>
          </div>
        )}

        {/* 
          Recent Work Subsection:
          Displays actual, verified screenshots of our real website projects
        */}
        {matchingProjects.length > 0 && (
          <div className="py-16 sm:py-24 border-b border-[#1C1C24]/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <p className="text-xs font-mono tracking-wider text-[#8E8E93] mb-2">
                  Featured work
                </p>
                <h2 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                  Related project showcases
                </h2>
              </div>
              <Link
                href="/works"
                className="text-xs sm:text-sm font-medium text-[#A1A1A6] hover:text-white transition-colors"
              >
                View all projects →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {matchingProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block relative rounded-xl overflow-hidden bg-[#0A0A0E] border border-[#1E1E26] hover:border-[#383846] transition-all duration-300 shadow-lg"
                  aria-label={`Visit live project: ${project.title}`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-black/60 relative">
                    <img
                      src={project.src}
                      alt={project.alt}
                      className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  <div className="p-5 sm:p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8E8E93] tracking-wider mb-1 font-mono">
                        {project.category}
                      </p>
                      <h3 className="text-base font-medium text-white group-hover:text-[#93c5fd] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] group-hover:bg-white group-hover:text-black text-white flex items-center justify-center transition-all duration-200 shrink-0 ml-3">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Project Call to Action */}
        <div className="py-16 sm:py-24 border-b border-[#1C1C24]/80">
          <div className="max-w-2xl">
            <h2 className="font-['Rigter',sans-serif] text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-4">
              Need this for your project?
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1A6] leading-relaxed mb-8">
              Tell us what you're building, and we'll help you define the right direction.
            </p>
            <GetStartedButton
              onClick={() => onOpenInquiry?.(service.name)}
              defaultText="Get in touch"
              hoverText="Start project"
              icon={<ArrowUpRight className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="pt-16 sm:pt-24 pb-20 sm:pb-28">
            <p className="text-xs font-mono tracking-wider text-[#8E8E93] mb-4">
              Explore more capabilities
            </p>
            <h2 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl text-white tracking-tight mb-8">
              Related services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedServices.map((related) => {
                const RelIcon = ICON_MAP[related.iconName] || Monitor;
                return (
                  <Link
                    key={related.id}
                    href={`/services/${related.slug}`}
                    className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <GlareHover
                      width="100%"
                      height="100%"
                      background="#09090D"
                      borderRadius="12px"
                      borderColor="#1A1A22"
                      mode="hover"
                      variant="streak"
                      glareColor="#ffffff"
                      glareOpacity={0.24}
                      glareSize={30}
                      softness={0.65}
                      glareAngle={-45}
                      blendMode="screen"
                      rimGlint
                      transitionDuration={650}
                      className="p-6 h-full flex flex-col justify-between transition-colors duration-200 group-hover:border-[#32323E]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono text-[#71717A] group-hover:text-[#A1A1A6] transition-colors">
                            {related.name}
                          </span>
                          <RelIcon className="w-4 h-4 text-[#8E8E93] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-medium text-white group-hover:text-[#93c5fd] transition-colors mb-2">
                          {related.name}
                        </h3>
                        <p className="text-xs text-[#8E8E93] line-clamp-2 leading-relaxed">
                          {related.shortDescription}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs text-[#71717A] group-hover:text-white transition-colors mt-5">
                        <span>View details</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </GlareHover>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ServiceDetailPage;
