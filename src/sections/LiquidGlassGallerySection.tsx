import React, { useState, useEffect } from 'react';
import {
  LiquidGlassCarousel,
  LiquidGlassCarouselItem,
} from '../components/ui/liquid-glass-carousel';

/**
 * ENTROPY — A Gallery of Ideas
 * Purely visual interlude featuring 8 curated abstract editorial pieces
 * representing ENTROPY's creative technology identity.
 */
export const galleryItems: LiquidGlassCarouselItem[] = [
  {
    title: 'Chrome Synthesis',
    src: '/assets/gallery/01-chrome-sculpture.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Typographic System',
    src: '/assets/gallery/02-experimental-typography.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Monolithic Shadows',
    src: '/assets/gallery/03-geometric-architecture.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Optical Refraction',
    src: '/assets/gallery/04-glass-refraction.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Computational Lattice',
    src: '/assets/gallery/05-generative-particles.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Obsidian Grain',
    src: '/assets/gallery/06-macro-texture.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Material Study',
    src: '/assets/gallery/07-material-study.jpg',
    aspect: 3 / 4,
  },
  {
    title: 'Spatial Equilibrium',
    src: '/assets/gallery/08-spatial-composition.jpg',
    aspect: 3 / 4,
  },
];

interface LiquidGlassGallerySectionProps {
  className?: string;
}

import { ScrollReveal } from '../components/common/ScrollReveal';

export const LiquidGlassGallerySection: React.FC<LiquidGlassGallerySectionProps> = ({
  className = '',
}) => {
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 480) return 320;
      if (w < 768) return 380;
      if (w < 1024) return 450;
      return 520;
    }
    return 520;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setPanelHeight(320);
      } else if (w < 768) {
        setPanelHeight(380);
      } else if (w < 1024) {
        setPanelHeight(450);
      } else {
        setPanelHeight(520);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="gallery"
      aria-label="A Gallery of Ideas"
      className={`relative w-full bg-[#000000] overflow-hidden select-none py-0 ${className}`}
    >
      <span id="explore" className="sr-only" />
      <ScrollReveal yOffset={20}>
        {/* Visual Interlude Carousel Container with grand vertical scale and zero dead gaps */}
        <div className="w-full h-[620px] sm:h-[720px] md:h-[820px] lg:h-[880px] xl:h-[920px] relative">
          {/* Soft top gradient blend */}
          <div
            className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-[#000000] via-[#000000]/75 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Soft bottom gradient blend */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#000000] via-[#000000]/75 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />

          <LiquidGlassCarousel
            items={galleryItems}
            panelHeight={panelHeight}
            gap={32}
            background="#000000"
            entry={true}
            className="w-full h-full"
          />
        </div>
      </ScrollReveal>
    </section>
  );
};
