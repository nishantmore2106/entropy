import React, { ReactNode, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from '../../router/Router';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * ENTROPY THREE-COLUMN CINEMATIC PAGE TRANSITION
 * 
 * Strict specifications:
 * 1. Exactly 3 independent, full-height vertical columns (33.333% width each, 100% height)
 *    using CSS Grid: grid-template-columns: repeat(3, minmax(0, 1fr)).
 * 2. Entrance directions:
 *    - Left column: enters from above (yPercent: -100 -> 0)
 *    - Center column: enters from below (yPercent: 100 -> 0)
 *    - Right column: enters from above (yPercent: -100 -> 0)
 * 3. Standalone ENTROPY symbol ONLY:
 *    - Four-slice circular emblem (/entropy-symbol.webp).
 *    - Absolutely NO wordmark, NO tagline, NO replacement text.
 *    - Centered precisely at x: 50vw, y: 50vh with subtle metallic sheen & cool blue glow.
 * 4. Phase B Exit / Closing animation (guaranteed to play):
 *    - Left column: exits upward (yPercent: 0 -> -100)
 *    - Center column: exits downward (yPercent: 0 -> 100)
 *    - Right column: exits upward (yPercent: 0 -> -100)
 *    - Symbol fades out during initial exit.
 *    - Destination page revealed immediately as columns retract.
 *    - Overlay removed from rendered interface on completion.
 * 5. Lifecycle isolation:
 *    - GSAP timeline is decoupled from route re-renders so it NEVER gets killed mid-flight.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { pathname, transitionPhase, onCovered, onTransitionComplete } = useRouter();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const col0Ref = useRef<HTMLDivElement | null>(null);
  const col1Ref = useRef<HTMLDivElement | null>(null);
  const col2Ref = useRef<HTMLDivElement | null>(null);
  const symbolContainerRef = useRef<HTMLDivElement | null>(null);
  const symbolGlowRef = useRef<HTMLDivElement | null>(null);
  const symbolSheenRef = useRef<HTMLDivElement | null>(null);

  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  // Prefers-reduced-motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Initial fresh visit brand intro check (once per session)
  const [isIntroRunning, setIsIntroRunning] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      const alreadyPlayed = sessionStorage.getItem('entropy_intro_played');
      if (alreadyPlayed) return false;
      sessionStorage.setItem('entropy_intro_played', '1');
      return true;
    } catch {
      return false;
    }
  });

  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(isIntroRunning);

  // Reduced motion media query listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Kill timeline ONLY on component unmount
  useEffect(() => {
    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
        activeTimelineRef.current = null;
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. INITIAL PAGE-LOAD BRAND INTRO
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isIntroRunning || prefersReducedMotion) {
      if (isIntroRunning) {
        setIsIntroRunning(false);
        setIsOverlayVisible(false);
      }
      return;
    }

    const col0 = col0Ref.current;
    const col1 = col1Ref.current;
    const col2 = col2Ref.current;
    const symbol = symbolContainerRef.current;
    const sheen = symbolSheenRef.current;
    const glow = symbolGlowRef.current;

    if (!col0 || !col1 || !col2 || !symbol) {
      setIsIntroRunning(false);
      setIsOverlayVisible(false);
      return;
    }

    // Set initial intro state: 3 columns closed covering screen, symbol centered
    gsap.set([col0, col1, col2], { yPercent: 0 });
    gsap.set(symbol, { opacity: 1, scale: 1 });
    if (glow) gsap.set(glow, { opacity: 0.6, scale: 1 });
    if (sheen) gsap.set(sheen, { xPercent: -120, opacity: 0 });

    const isMobile = window.innerWidth < 768;
    const durRetract = isMobile ? 0.40 : 0.48;
    const stagger = isMobile ? 0.05 : 0.08;

    const introTl = gsap.timeline({
      onComplete: () => {
        setIsIntroRunning(false);
        setIsOverlayVisible(false);
        activeTimelineRef.current = null;
      },
    });

    activeTimelineRef.current = introTl;

    // Metallic sheen sweep across symbol
    if (sheen) {
      introTl.to(
        sheen,
        {
          xPercent: 220,
          opacity: 1,
          duration: 0.42,
          ease: 'power2.inOut',
        },
        0.25
      );
    }

    // Fade out symbol
    introTl.to(
      symbol,
      {
        opacity: 0,
        duration: 0.20,
        ease: 'power2.in',
      },
      0.68
    );

    if (glow) {
      introTl.to(
        glow,
        {
          opacity: 0,
          duration: 0.20,
          ease: 'power2.in',
        },
        0.68
      );
    }

    // Retract columns (shutter opening: left & right UP, center DOWN)
    introTl.to(
      col0,
      {
        yPercent: -100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      0.74
    );

    introTl.to(
      col1,
      {
        yPercent: 100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      0.74 + stagger
    );

    introTl.to(
      col2,
      {
        yPercent: -100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      0.74 + stagger * 2
    );

    // Safety timeout
    const safety = window.setTimeout(() => {
      setIsIntroRunning(false);
      setIsOverlayVisible(false);
    }, 1800);

    return () => {
      window.clearTimeout(safety);
      if (activeTimelineRef.current === introTl) {
        introTl.kill();
        activeTimelineRef.current = null;
      }
    };
  }, [isIntroRunning, prefersReducedMotion]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ROUTE NAVIGATION TRANSITION (Phase A Entrance & Phase B Retraction)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Only trigger when router enters 'covering' state and intro is not running
    if (transitionPhase !== 'covering' || isIntroRunning) {
      return;
    }

    // If an animation is already actively running, do not re-run Phase A
    if (isAnimatingRef.current) {
      return;
    }

    // Reduced motion fallback: immediate route swap & fast fade
    if (prefersReducedMotion) {
      onCovered();
      const t = window.setTimeout(() => {
        onTransitionComplete();
      }, 120);
      return () => window.clearTimeout(t);
    }

    const col0 = col0Ref.current;
    const col1 = col1Ref.current;
    const col2 = col2Ref.current;
    const symbol = symbolContainerRef.current;
    const sheen = symbolSheenRef.current;
    const glow = symbolGlowRef.current;

    if (!col0 || !col1 || !col2 || !symbol) {
      onCovered();
      onTransitionComplete();
      return;
    }

    isAnimatingRef.current = true;
    setIsOverlayVisible(true);

    const isMobile = window.innerWidth < 768;
    const durEntrance = isMobile ? 0.38 : 0.46;
    const durRetract = isMobile ? 0.38 : 0.46;
    const stagger = isMobile ? 0.05 : 0.08;
    const durSheen = isMobile ? 0.30 : 0.36;

    // Reset initial column positions:
    // Left column: enters from top (-100%)
    // Center column: enters from bottom (100%)
    // Right column: enters from top (-100%)
    gsap.set(col0, { yPercent: -100 });
    gsap.set(col1, { yPercent: 100 });
    gsap.set(col2, { yPercent: -100 });
    gsap.set(symbol, { opacity: 0, scale: 0.94 });
    if (glow) gsap.set(glow, { opacity: 0, scale: 0.85 });
    if (sheen) gsap.set(sheen, { xPercent: -120, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        setIsOverlayVisible(false);
        activeTimelineRef.current = null;
        onTransitionComplete();
      },
    });

    activeTimelineRef.current = tl;

    // ─────────────────────────────────────────────────────────────────────────
    // Phase A — Entrance of the 3 Independent Columns
    // ─────────────────────────────────────────────────────────────────────────
    tl.to(
      col0,
      {
        yPercent: 0,
        duration: durEntrance,
        ease: 'power3.inOut',
      },
      0
    );

    tl.to(
      col1,
      {
        yPercent: 0,
        duration: durEntrance,
        ease: 'power3.inOut',
      },
      stagger
    );

    tl.to(
      col2,
      {
        yPercent: 0,
        duration: durEntrance,
        ease: 'power3.inOut',
      },
      stagger * 2
    );

    // Exact timestamp when all three columns meet and cover the viewport
    const convergedTime = stagger * 2 + durEntrance;

    // Update destination route underneath while 100% covered by black columns
    tl.add(() => {
      onCovered();
    }, convergedTime);

    // Reveal standalone ENTROPY symbol at viewport center
    tl.to(
      symbol,
      {
        opacity: 1,
        scale: 1.0,
        duration: 0.20,
        ease: 'power2.out',
      },
      convergedTime
    );

    if (glow) {
      tl.to(
        glow,
        {
          opacity: 0.70,
          scale: 1.05,
          duration: 0.28,
          ease: 'sine.out',
        },
        convergedTime
      );
    }

    if (sheen) {
      tl.to(
        sheen,
        {
          xPercent: 220,
          opacity: 1,
          duration: durSheen,
          ease: 'power2.inOut',
        },
        convergedTime + 0.04
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Brief Symbol Hold
    // ─────────────────────────────────────────────────────────────────────────
    const holdDuration = isMobile ? 0.14 : 0.18;
    const holdEndTime = convergedTime + Math.max(0.22, durSheen) + holdDuration;

    // ─────────────────────────────────────────────────────────────────────────
    // Phase B — Closing / Retraction & Destination Page Reveal
    // Left & Right columns exit UPWARD (-100%), Center column exits DOWNWARD (100%)
    // ─────────────────────────────────────────────────────────────────────────
    // Fade out standalone symbol as exit begins
    tl.to(
      symbol,
      {
        opacity: 0,
        duration: 0.16,
        ease: 'power2.in',
      },
      holdEndTime
    );

    if (glow) {
      tl.to(
        glow,
        {
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in',
        },
        holdEndTime
      );
    }

    // Retract columns in reverse alternating directions
    tl.to(
      col0,
      {
        yPercent: -100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      holdEndTime + 0.02
    );

    tl.to(
      col1,
      {
        yPercent: 100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      holdEndTime + 0.02 + stagger
    );

    tl.to(
      col2,
      {
        yPercent: -100,
        duration: durRetract,
        ease: 'power3.inOut',
      },
      holdEndTime + 0.02 + stagger * 2
    );

    // Note: Do not kill tl on effect cleanup! The timeline runs to completion.
  }, [transitionPhase, isIntroRunning, prefersReducedMotion, onCovered, onTransitionComplete]);

  return (
    <>
      {/* 
        ========================================================================
        1. PAGE CONTENT WRAPPER
        ========================================================================
      */}
      <div
        key={pathname}
        className="w-full flex-1 flex flex-col justify-between"
      >
        {children}
      </div>

      {/* 
        ========================================================================
        2. THREE-COLUMN CINEMATIC TRANSITION OVERLAY
        - 100vw x 100vh viewport-fixed container (z-[9999]).
        - Strict CSS Grid with 3 equal columns: repeat(3, minmax(0, 1fr)).
        - When idle/finished: display is 'none' and pointer-events are disabled.
        - When active: pointer-events are 'auto' to guard interactions during motion.
        ========================================================================
      */}
      <div
        ref={overlayRef}
        aria-hidden={!isOverlayVisible}
        className="fixed inset-0 z-[9999] overflow-hidden select-none"
        style={{
          display: isOverlayVisible ? 'block' : 'none',
          pointerEvents: isOverlayVisible ? 'auto' : 'none',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'transparent',
        }}
      >
        {/* CSS GRID: EXACTLY THREE EQUAL VERTICAL COLUMNS */}
        <div
          className="w-full h-full grid"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            width: '100vw',
            height: '100vh',
          }}
        >
          {/* COLUMN 0: LEFT COLUMN (33.333% width, 100% height) */}
          <div
            ref={col0Ref}
            data-testid="column-left"
            className="relative w-full h-full bg-[#000000] overflow-hidden will-change-transform"
            style={{
              outline: '1px solid #000000',
            }}
          >
            {/* Leading hairline edge highlight in motion */}
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>

          {/* COLUMN 1: CENTER COLUMN (33.333% width, 100% height) */}
          <div
            ref={col1Ref}
            data-testid="column-center"
            className="relative w-full h-full bg-[#000000] overflow-hidden will-change-transform"
            style={{
              outline: '1px solid #000000',
            }}
          >
            {/* Leading hairline edge highlight in motion */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          </div>

          {/* COLUMN 2: RIGHT COLUMN (33.333% width, 100% height) */}
          <div
            ref={col2Ref}
            data-testid="column-right"
            className="relative w-full h-full bg-[#000000] overflow-hidden will-change-transform"
            style={{
              outline: '1px solid #000000',
            }}
          >
            {/* Leading hairline edge highlight in motion */}
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* 
          ======================================================================
          3. STANDALONE ENTROPY SYMBOL OVERLAY
          - Displays ONLY the four-slice circular emblem (/entropy-symbol.webp).
          - NEVER displays the wordmark, text, or tagline.
          - Assembles and shines at the exact center of the screen.
          ======================================================================
        */}
        <div
          ref={symbolContainerRef}
          data-testid="assembled-symbol-overlay"
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0"
        >
          <div className="relative flex items-center justify-center">
            {/* Restrained cool blue-white ambient backlight */}
            <div
              ref={symbolGlowRef}
              className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full pointer-events-none -z-10 opacity-0"
              style={{
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 75%)',
                filter: 'blur(30px)',
              }}
            />

            {/* Standalone ENTROPY 4-slice circular emblem */}
            <img
              src="/entropy-symbol.webp"
              alt="ENTROPY Symbol"
              className="w-20 h-20 min-[420px]:w-24 min-[420px]:h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain select-none pointer-events-none filter drop-shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
              width={503}
              height={501}
              loading="eager"
              decoding="sync"
            />

            {/* Metallic Sheen Sweep Overlay across symbol */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
              <div
                ref={symbolSheenRef}
                className="absolute -inset-y-2 -left-full w-full pointer-events-none opacity-0"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.85) 48%, rgba(56, 189, 248, 0.95) 54%, transparent 80%)',
                  mixBlendMode: 'screen',
                  willChange: 'transform, opacity',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageTransition;
