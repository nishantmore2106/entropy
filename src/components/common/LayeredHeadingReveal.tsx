import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export interface LayeredHeadingRevealProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  headingClassName?: string;
  subtitleClassName?: string;
}

/**
 * ENTROPY — Layered Hero Heading Transition
 * 
 * Cinematic scroll-linked transition where the large hero heading moves slowly upward
 * and disappears behind the following content section (z-10, bg-[#000000]).
 * 
 * Visual Sequence:
 * 1. At the top of the page, the hero heading is prominent and crisp against the black canvas.
 * 2. As the user scrolls down, the heading glides upward by ~45-55px, safely below the navbar.
 * 3. The following content layer (relative z-10, bg-[#000000]) scrolls at normal full speed,
 *    naturally overtaking and passing in front of the heading.
 * 4. The heading is gradually concealed from the bottom upward as it slips behind that layer.
 * 5. Full prefers-reduced-motion support (static placement, zero layout shift).
 */
export const LayeredHeadingReveal: React.FC<LayeredHeadingRevealProps> = ({
  title,
  subtitle,
  className = '',
  headingClassName = '',
  subtitleClassName = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Parallax transform calculation:
  // Desktop: 300px scroll - 245px local drift = 55px net upward movement in viewport.
  // Mobile:  240px scroll - 200px local drift = 40px net upward movement in viewport.
  // This ensures the top of the heading never collides with the top navbar dock (safe margin >= 15px).
  // The following content layer overtakes the heading and naturally conceals it from the bottom up!
  const transitionRange = isMobile ? [0, 240, 400] : [0, 300, 500];
  const localDriftRange = isMobile ? [0, 200, 200] : [0, 245, 245];

  const y = useTransform(scrollY, transitionRange, localDriftRange);

  // Opacity remains 1.0 while passing behind the following section.
  // It only fades out AFTER it is already concealed behind the opaque content layer.
  const opacity = useTransform(
    scrollY,
    isMobile ? [0, 210, 280] : [0, 270, 340],
    [1, 1, 0]
  );

  if (shouldReduceMotion) {
    return (
      <header
        className={`relative z-0 text-center max-w-5xl mx-auto pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 select-none ${className}`}
      >
        <h1
          className={`font-['Rigter',sans-serif] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[0.95] mb-4 ${headingClassName}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-xs sm:text-sm md:text-base text-[#A0A0A0] font-normal leading-relaxed max-w-xl mx-auto text-balance ${subtitleClassName}`}
          >
            {subtitle}
          </p>
        )}
      </header>
    );
  }

  return (
    <header
      className={`relative z-0 w-full min-h-[290px] sm:min-h-[350px] lg:min-h-[390px] pt-28 sm:pt-32 lg:pt-36 pb-6 sm:pb-8 text-center select-none flex flex-col justify-start items-center ${className}`}
    >
      <motion.div
        style={{ y, opacity }}
        className="max-w-5xl mx-auto px-4 sm:px-6 will-change-transform pointer-events-none"
      >
        <h1
          className={`font-['Rigter',sans-serif] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[0.95] mb-4 text-balance ${headingClassName}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-xs sm:text-sm md:text-base text-[#A0A0A0] font-normal leading-relaxed max-w-xl mx-auto text-balance ${subtitleClassName}`}
          >
            {subtitle}
          </p>
        )}
      </motion.div>
    </header>
  );
};

export default LayeredHeadingReveal;
