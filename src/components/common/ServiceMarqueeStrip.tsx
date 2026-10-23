import React from 'react';
import styles from './ServiceMarqueeStrip.module.css';

const MARQUEE_SERVICES: string[] = [
  'Brand Strategy',
  'Brand Identity',
  'Logo Design',
  'UI/UX Design',
  'Website Design & Development',
  'Landing Pages',
  'E-commerce Development',
  'Code Customization',
];

interface ServiceMarqueeStripProps {
  className?: string;
}

/**
 * ENTROPY — Service Name Horizontal Marquee
 * Positioned immediately above the What We Do section.
 * Restrained dark-grey background (~#303030) with white text and clean bullet separators.
 * Seamless, continuous CSS transform loop with reduced-motion support.
 */
export const ServiceMarqueeStrip: React.FC<ServiceMarqueeStripProps> = ({ className = '' }) => {
  return (
    <div
      className={`${styles.marqueeContainer} ${className}`}
      aria-label="ENTROPY Studio Core Capabilities Marquee"
    >
      <div className={styles.marqueeTrack} aria-hidden="true">
        {/* 4 Identical Groups for 100% seamless infinite loop across any display width (including 4K) */}
        {[0, 1, 2, 3].map((setIndex) => (
          <div key={`group-${setIndex}`} className={styles.marqueeGroup}>
            {MARQUEE_SERVICES.map((service, index) => (
              <span key={`group${setIndex}-${index}`} className={styles.marqueeItem}>
                <span>{service}</span>
                <span className={styles.dotSeparator} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceMarqueeStrip;
