import React, { useRef, useState, useEffect, useCallback } from 'react';
import { WorksWheel, WorksWheelItem } from '../components/ui/works-wheel';
import { ProjectItem, projectsData } from '../data/projectsData';

interface SelectedWorkSectionProps {
  onSelectProject?: (project: ProjectItem) => void;
  onOpenInquiry?: (service?: string) => void;
  className?: string;
}

/**
 * Verified portfolio projects dataset for the WorksWheel 3D stage.
 * Preserves all 17 genuine ENTROPY projects (15 web + 2 UI/UX flagship apps)
 * mapped to their comprehensive projectItem definitions.
 */
export const entropyWheelProjects: WorksWheelItem[] = [
  {
    title: 'Glitch',
    image: '/projects/glitch.webp',
    href: 'https://glitchcolhing.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'glitch'),
  },
  {
    title: 'Beyond Growth',
    image: '/projects/beyond-growth.webp',
    href: 'https://beyondgrowth.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'beyond-growth'),
  },
  {
    title: 'Lumina',
    image: '/projects/lumina.webp',
    href: 'https://luminawebagencie.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'lumina'),
  },
  {
    title: 'Journey AI',
    image: '/projects/journey-ai.webp',
    href: 'https://journeywithai.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'journey-ai'),
  },
  {
    title: 'Snow Luxury',
    image: '/projects/snow-luxury.webp',
    href: 'https://snowluxury.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'snow-luxury'),
  },
  {
    title: 'BuilderAura',
    image: '/projects/builder-aura.webp',
    href: 'https://buidleraura.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'builder-aura'),
  },
  {
    title: 'VoltixAura',
    image: '/projects/voltix-aura.webp',
    href: 'https://voltixaura.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'voltix-aura'),
  },
  {
    title: 'Travel Japan Escape',
    image: '/projects/japan-escape.webp',
    href: 'https://traveljapanescape.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'travel-japan'),
  },
  {
    title: 'Quiet Shelf',
    image: '/projects/quiet-shelf.webp',
    href: 'https://quiteshelf.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'quiet-shelf'),
  },
  {
    title: 'Hiroshi Samurai',
    image: '/projects/hiroshi-archive.webp',
    href: 'https://hiroshi-samurai.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'hiroshi-samurai'),
  },
  {
    title: 'Gujarat Manpower',
    image: '/projects/gujarat-manpower.webp',
    href: 'https://gujaratmanpowerservices.com/',
    projectItem: projectsData.find((p) => p.id === 'gujarat-manpower'),
  },
  {
    title: 'Bites Bombay Sandwich',
    image: '/projects/bites-bombay.webp',
    href: 'https://bitesbombaysandwich.in/',
    projectItem: projectsData.find((p) => p.id === 'bites-bombay'),
  },
  {
    title: 'FortuneMakers',
    image: '/projects/fortune-makers.webp',
    href: 'https://fortunemakeres.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'fortune-makers'),
  },
  {
    title: 'Paws & Purrs',
    image: '/projects/paws-purrs.webp',
    href: 'https://pawspurs.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'paws-purrs'),
  },
  {
    title: 'Atelier Kitchens',
    image: '/projects/atelier-kitchen.webp',
    href: 'https://atelierkithcens.netlify.app/',
    projectItem: projectsData.find((p) => p.id === 'atelier-kitchens'),
  },
  {
    title: 'PULSE',
    image: '/projects/pulse.webp',
    href: '/services/ui-ux-design',
    projectItem: projectsData.find((p) => p.id === 'pulse'),
  },
  {
    title: 'ReDesign it',
    image: '/projects/redesign-it.webp',
    href: '/services/ui-ux-design',
    projectItem: projectsData.find((p) => p.id === 'redesign-it'),
  },
];

export const SelectedWorkSection: React.FC<SelectedWorkSectionProps> = ({
  onSelectProject,
  className = '',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowH = window.innerHeight;
    const scrollDistance = containerRef.current.offsetHeight - windowH;

    if (scrollDistance <= 0) {
      setScrollProgress(0);
      return;
    }

    // rect.top === 0 -> top of container touches top of viewport -> progress = 0
    // rect.top === -scrollDistance -> bottom of container touches bottom of viewport -> progress = 1
    const scrolled = -rect.top;
    const rawProgress = Math.max(0, Math.min(1, scrolled / scrollDistance));
    setScrollProgress(rawProgress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [updateProgress]);

  const handleSelectIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const count = entropyWheelProjects.length;
    const last = count - 1;
    // Map index (0..last) to progress within [0.03, 0.92]
    const targetP = 0.03 + ((index + 1) / (last + 1)) * (0.92 - 0.03);
    const rect = containerRef.current.getBoundingClientRect();
    const windowH = window.innerHeight;
    const scrollDistance = containerRef.current.offsetHeight - windowH;
    const containerTop = rect.top + window.scrollY;
    const targetScrollY = containerTop + targetP * scrollDistance;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section
      ref={containerRef}
      id="selected-work"
      className={`relative w-full bg-[#000000] h-[calc(100svh+160vh)] lg:h-[calc(100svh+220vh)] select-none isolate ${className}`}
      aria-label="Selected Work — ENTROPY Portfolio"
    >
      {/* Sticky inner viewport stage: keeps the 3D drum pinned while user scrolls through the track */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <WorksWheel
          items={entropyWheelProjects}
          label="Selected work"
          action="View project"
          progress={scrollProgress}
          onSelectIndex={handleSelectIndex}
          onSelectProject={onSelectProject}
          className="w-full h-full bg-[#000000]"
        />
      </div>
    </section>
  );
};

export default SelectedWorkSection;
