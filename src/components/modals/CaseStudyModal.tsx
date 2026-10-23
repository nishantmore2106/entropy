import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { ProjectItem } from '../../data/projectsData';
import { ProceduralProjectPreview } from '../common/ProceduralProjectPreview';
import { GetStartedButton } from '../ui/GetStartedButton';

interface CaseStudyModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenInquiry: (initialService?: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  onOpenInquiry,
}) => {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (project) {
      setActiveImage(project.image);
    }
  }, [project]);

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl h-full bg-[#0B0B0D] border-l border-[#1E1E24] overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-5 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#1E1E24]">
          <div className="flex items-center gap-3 text-xs font-mono text-[#8B8B8B]">
            <span>{project.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8B8B8B] hover:text-[#F4F4F2] hover:bg-[#1E1E24] rounded-md transition-colors cursor-pointer"
            aria-label="Close case study"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-10 space-y-10 flex-1">
          {/* Title & Tagline */}
          <div>
            <h2
              id="case-study-title"
              className="text-3xl sm:text-4xl font-bold font-display text-[#F4F4F2] tracking-tight"
            >
              {project.title}
            </h2>
            <p className="mt-2 text-lg text-[#E85A32] font-medium font-sans">
              {project.tagline}
            </p>
            <p className="mt-4 text-base text-[#A1A1AA] leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          {/* Real Showcase Artboard & Screen Gallery */}
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-[#27272A] aspect-[16/10] bg-[#0E0E12] group">
              <img
                src={activeImage || project.image}
                alt={project.title}
                className="w-full h-full object-cover object-top transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                <span className="text-xs font-medium text-[#D4D4D8] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
                  {project.category}
                </span>
                {project.url.startsWith('http') ? (
                  <GetStartedButton
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    defaultText="Visit live site"
                    hoverText="Open project"
                    icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    className="text-xs"
                  />
                ) : (
                  <GetStartedButton
                    to={project.url}
                    onClick={onClose}
                    defaultText="Explore Service"
                    hoverText="View capability"
                    icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            {/* Gallery Thumbnails Strip (if multiple screens exist) */}
            {project.gallery && project.gallery.length > 0 && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2 flex items-center justify-between">
                  <span>Design System & Screens ({project.gallery.length} Views)</span>
                  <span className="text-[10px] text-[#A1A1AA] lowercase font-sans">click to inspect view</span>
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                  {project.gallery.map((screen, sIdx) => {
                    const isSelected = (activeImage || project.image) === screen;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setActiveImage(screen)}
                        className={`relative aspect-[16/10] rounded-md overflow-hidden border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-[#93c5fd] ring-2 ring-[#3b82f6]/40 scale-[1.02]'
                            : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`View screen ${sIdx + 1}`}
                      >
                        <img
                          src={screen}
                          alt={`${project.title} screen ${sIdx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Impact Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 p-5 bg-[#070709] border border-[#1E1E24] rounded-lg">
            {project.impactMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#F4F4F2] tabular-nums">
                  {metric.value}
                </div>
                <div className="text-xs text-[#8B8B8B] font-mono leading-tight">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 bg-[#101014] border border-[#1E1E24] rounded-lg">
              <h3 className="text-xs font-mono tracking-wider text-[#8B8B8B] mb-2">
                The Challenge
              </h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                {project.challenge}
              </p>
            </div>

            <div className="p-5 bg-[#101014] border border-[#1E1E24] rounded-lg">
              <h3 className="text-xs font-mono tracking-wider text-[#93c5fd] mb-2">
                The Studio Solution
              </h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Deliverables List */}
          <div>
            <h3 className="text-xs font-mono tracking-wider text-[#8B8B8B] mb-4">
              Scope & Deliverables
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {project.deliverables.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm text-[#D4D4D8]"
                >
                  <Check className="w-4 h-4 text-[#93c5fd] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="text-xs font-mono tracking-wider text-[#8E8E93] mb-3">
              Technologies & Methodologies
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-[#A1A1AA]">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#15151A] border border-[#27272A] rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="p-6 bg-[#0E0E12] border border-[#27272A] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-[#F4F4F2]">
                Need a similar capability?
              </h4>
              <p className="text-xs text-[#8B8B8B] mt-0.5">
                Explore tailoring an engagement architecture for your product.
              </p>
            </div>

            <GetStartedButton
              onClick={() => {
                onClose();
                onOpenInquiry(project.category);
              }}
              defaultText="Discuss project"
              hoverText="Start enquiry"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="text-xs shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
