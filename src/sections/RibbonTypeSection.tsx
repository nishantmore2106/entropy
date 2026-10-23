import React, { useState, useEffect, useMemo } from 'react';
import RibbonType from '../components/ui/ribbon-type';

interface RibbonTypeSectionProps {
  className?: string;
}

export const RibbonTypeSection: React.FC<RibbonTypeSectionProps> = ({ className = '' }) => {
  // Service and capability labels as requested
  const ribbonText = [
    'UI/UX Design',
    'Brand Identity',
    'Website Design',
    'Website Development',
    'Creative Direction',
    'Digital Experiences',
    'Landing Pages',
    'Code Customization',
    'Website Redesign',
    'Performance Optimization',
  ].join('  ·  ');

  // Track window width reactively to adjust ribbon geometry across mobile, tablet, and desktop
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1200;
  });

  useEffect(() => {
    let rAF = 0;
    const handleResize = () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rAF);
    };
  }, []);

  // Compute responsive ribbon configuration to guarantee zero text clipping, no overflow,
  // and perfectly balanced visual density across compact mobile, large mobile, tablet, and desktop
  const config = useMemo(() => {
    if (windowWidth < 440) {
      // Compact Mobile (<440px: iPhone SE, iPhone 12/13/14/15, Galaxy S series)
      return {
        ribbonWidth: 38,
        gap: 66,
        amplitude: 25,
        depth: 48,
        frequency: 0.92,
        textScale: 0.52,
        speed: 42,
        perspective: 26,
        tilt: -3,
      };
    } else if (windowWidth < 640) {
      // Standard / Large Mobile (440px - 639px)
      return {
        ribbonWidth: 44,
        gap: 78,
        amplitude: 30,
        depth: 60,
        frequency: 0.95,
        textScale: 0.50,
        speed: 48,
        perspective: 28,
        tilt: -3.5,
      };
    } else if (windowWidth < 1024) {
      // Tablet / Medium Screen (640px - 1023px)
      return {
        ribbonWidth: 56,
        gap: 102,
        amplitude: 42,
        depth: 82,
        frequency: 1.0,
        textScale: 0.48,
        speed: 56,
        perspective: 30,
        tilt: -4,
      };
    } else {
      // Desktop / Large Displays (>= 1024px)
      return {
        ribbonWidth: 72,
        gap: 130,
        amplitude: 55,
        depth: 110,
        frequency: 1.05,
        textScale: 0.48,
        speed: 65,
        perspective: 32,
        tilt: -4,
      };
    }
  }, [windowWidth]);

  return (
    <section
      id="studio-capabilities-ribbon"
      aria-label="Studio Capabilities Ribbon"
      className={`relative w-full max-w-full overflow-hidden bg-[#000000] border-y border-white/[0.06] select-none touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Subtle atmospheric ambient glow behind ribbon in studio cyan/navy */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(14, 165, 233, 0.08) 0%, rgba(2, 6, 23, 0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Ribbon Type WebGL canvas container with responsive fluid height */}
      <div
        className="relative z-10 w-full h-[210px] min-[440px]:h-[240px] sm:h-[300px] md:h-[350px] lg:h-[420px] flex items-center justify-center touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        <RibbonType
          text={ribbonText}
          separator="  ·  "
          colors={['#080c18', '#FFFFFF']}
          band={true}
          path="wave"
          ribbons={2}
          gap={config.gap}
          ribbonWidth={config.ribbonWidth}
          textScale={config.textScale}
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight={600}
          letterSpacing={0.08}
          amplitude={config.amplitude}
          frequency={config.frequency}
          depth={config.depth}
          twist={0.16}
          twistSpeed={0.14}
          speed={config.speed}
          direction="left"
          flow={0.28}
          tilt={config.tilt}
          perspective={config.perspective}
          shading={0.65}
          sheen={0.45}
          hoverSpeed={0.3}
          draggable={true}
          clickTwist={true}
          autoTwist={6}
          intro={true}
          quality={1}
          className="w-full h-full"
        />
      </div>
    </section>
  );
};

export default RibbonTypeSection;
