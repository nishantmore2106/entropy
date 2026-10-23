import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  style?: React.CSSProperties;
}

/**
 * Standardized Scroll-Reveal Component for ENTROPY
 * Provides smooth, restrained entrance animations:
 * - Subtle fade in from 0 opacity
 * - Slight upward translation (16-24px default 20px)
 * - Cubic bezier easing [0.16, 1, 0.3, 1]
 * - Instant unhindered visibility when prefers-reduced-motion is active
 * - No layout shift or unmount side-effects
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.75,
  yOffset = 20,
  style,
}) => {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
