import React, { useState, useEffect } from 'react';
import { VoxelArc } from '../../components/ui/VoxelArc';
import { EntropyLogo3D } from '../../components/logo/EntropyLogo3D';

export interface VoxelArcHeroProps {
  onOpenInquiry?: (serviceName?: string) => void;
  className?: string;
}

/**
 * ENTROPY VOXEL ARC HERO
 * 
 * Minimal black-and-white creative-technology studio hero.
 * Features:
 * - Voxel Arc: Curved horizon of square voxels rolling like a calm digital sea.
 * - Wordmark: 'entr [EMPTY O SLOT] py' in Rigter Regular font.
 * - Cinematic Page-Load Reveal:
 *    Stage 1 (0–200ms): Pure black void while WebGL context & shaders initialize.
 *    Stage 2 (200ms+): Voxel Arc emerges smoothly with gentle opacity fade.
 *    Stage 3 (600ms+): Wordmark glides up with subtle 10px translate-y and fade-in.
 *    Stage 4 (~1500ms): Fully settled into permanent final layout.
 */
export const VoxelArcHero: React.FC<VoxelArcHeroProps> = ({
  className = '',
}) => {
  // Reveal stage state:
  // 0: Initial black void (concealed)
  // 1: Voxel Arc fading in
  // 2: Wordmark fading and gliding in
  // 3: Fully settled final state
  const [revealStage, setRevealStage] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        return 3;
      }
    } catch {
      return 3;
    }
    return 0;
  });

  useEffect(() => {
    // If reduced motion is preferred, immediately settle
    if (revealStage === 3) return;

    // Stage 1: Reveal Voxel Arc promptly after mount (50ms)
    const t1 = setTimeout(() => {
      setRevealStage(1);
    }, 50);

    // Stage 2: Reveal Wordmark with coordinated timing (180ms)
    const t2 = setTimeout(() => {
      setRevealStage(2);
    }, 180);

    // Stage 3: Settle into permanent layout (600ms)
    const t3 = setTimeout(() => {
      setRevealStage(3);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const showVoxels = revealStage >= 1;
  const showWordmark = revealStage >= 2;

  return (
    <section
      id="hero"
      aria-label="ENTROPY Studio Hero"
      className={`relative w-full h-screen min-h-[100svh] bg-[#000000] overflow-hidden select-none cursor-default ${className}`}
    >
      {/* 
        Full-viewport Voxel Arc component as primary hero visual background.
        Emerge smoothly from the initial black void with a premium easing curve.
      */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-[1100ms] ${
          showVoxels ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <VoxelArc
          color="#D8DBE6"
          accentColor="#FFFFFF"
          backgroundColor="#000000"
          curvature={0.55}
          horizon={0.52}
          waveHeight={0.45}
          waveLength={1.4}
          speed={0.28}
          turbulence={0.12}
          voxelSize={0.52}
          roundness={0.18}
          glow={1.1}
          bloom={0.4}
          haze={0.8}
          aperture={0.42}
          interactive={true}
          ripples={1}
          intro={true}
          className="w-full h-full"
        />
      </div>

      {/* 
        ENTROPY Wordmark & Metallic Chrome Tagline
        - On mobile: Centered in the viewport above the voxel horizon (justify-center pb-[5svh])
        - On desktop: Sits near top edge (sm:justify-start sm:pt-[13vh] md:pt-[14vh] lg:pt-[15vh])
        - Smooth coordinated reveal animation with opacity & subtle 10px glide
      */}
      <div className="absolute inset-0 z-20 pointer-events-none w-full h-full flex flex-col items-center justify-center pb-[5svh] sm:pb-0 sm:justify-start sm:pt-[18vh] md:pt-[20vh] lg:pt-[21vh] xl:pt-[22vh]">
        <div
          className={`w-full max-w-7xl px-2 min-[360px]:px-3 sm:px-6 md:px-8 flex flex-col justify-center items-center transition-all duration-[800ms] ${
            showWordmark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: revealStage < 3 ? 'opacity, transform' : 'auto',
          }}
          aria-label="ENTROPY Brand"
        >
          <h1
            className="flex items-baseline justify-center font-normal lowercase text-[#FFFFFF] font-['Rigter_Regular',_'Rigter',_sans-serif] text-[56px] min-[360px]:text-[64px] min-[380px]:text-[72px] min-[410px]:text-[78px] min-[480px]:text-[86px] sm:text-8xl md:text-9xl lg:text-[142px] xl:text-[158px] tracking-[0.05em] leading-none select-none text-center"
            style={{ fontFamily: "'Rigter Regular', 'Rigter', sans-serif" }}
          >
            {/* Prefix letters: ent + r (with r having no trailing letter-spacing for strictly equal spacing to the logo) */}
            <span className="leading-none shrink-0 flex items-baseline">
              <span>ent</span>
              <span style={{ letterSpacing: 0 }}>r</span>
            </span>

            {/* 
              Dedicated, precisely centered slot between r and p.
              Renders our custom interactive 3D logo model representing 'o'.
              Spacing: balanced ml-[0.04em] and mr-[0.045em] for optically equal distance from r and to p.
              Scale adapts automatically via em units and ResizeObserver.
            */}
            <div
              id="hero-wordmark-logo-slot"
              aria-label="ENTROPY 3D Logo Emblem"
              className="hero-logo-slot relative inline-flex items-center justify-center shrink-0 w-[0.82em] h-[0.82em] ml-[0.04em] mr-[0.045em] translate-y-[0.14em] pointer-events-auto"
            >
              <EntropyLogo3D />
            </div>

            {/* Suffix letters: p + y (with y having no trailing letter-spacing for strict geometric horizontal centering) */}
            <span className="leading-none shrink-0 flex items-baseline">
              <span>p</span>
              <span style={{ letterSpacing: 0 }}>y</span>
            </span>
          </h1>

          {/* 
            ENTROPY Metallic Chrome Tagline
            - Exact text: Your Creative Partner for Brand, Design & Technology.
            - Centered beneath the wordmark
            - Balanced responsive font sizing & letter-spacing across viewports
            - Font: Sirage Regular (with graceful fallback to Outfit/sans-serif)
            - Color: Pure radiant metallic chrome only
          */}
          <div
            className="relative mt-4 min-[380px]:mt-5 sm:mt-7 md:mt-9 lg:mt-11 xl:mt-12 max-w-full text-center flex items-center justify-center pointer-events-auto"
            aria-label="Your Creative Partner for Brand, Design & Technology."
          >
            {/* Base Pure Metallic Chrome Layer */}
            <span
              className="chrome-tagline-base inline-block whitespace-nowrap font-medium font-['Outfit',sans-serif] text-[10.5px] min-[360px]:text-[11.5px] min-[390px]:text-[12.5px] min-[420px]:text-[14px] min-[480px]:text-[15.5px] sm:text-[18px] md:text-[22px] lg:text-[25px] xl:text-[28px] tracking-[0.03em] min-[360px]:tracking-[0.04em] min-[390px]:tracking-[0.05em] sm:tracking-[0.07em] md:tracking-[0.09em] lg:tracking-[0.11em] xl:tracking-[0.12em] select-none text-center"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Your Creative Partner for Brand, Design &amp; Technology.
            </span>

            {/* Pure Metallic Chrome Specular Sweep Overlay */}
            <span
              aria-hidden="true"
              className="chrome-tagline-shine absolute inset-0 inline-block whitespace-nowrap font-medium font-['Outfit',sans-serif] text-[10.5px] min-[360px]:text-[11.5px] min-[390px]:text-[12.5px] min-[420px]:text-[14px] min-[480px]:text-[15.5px] sm:text-[18px] md:text-[22px] lg:text-[25px] xl:text-[28px] tracking-[0.03em] min-[360px]:tracking-[0.04em] min-[390px]:tracking-[0.05em] sm:tracking-[0.07em] md:tracking-[0.09em] lg:tracking-[0.11em] xl:tracking-[0.12em] select-none pointer-events-none text-center"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Your Creative Partner for Brand, Design &amp; Technology.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
