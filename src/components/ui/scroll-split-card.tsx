"use client";

import { cn } from "../../lib/utils";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export interface ScrollSplitFeatureItem {
  label: string;
  icon?: React.ReactNode;
}

export interface ScrollSplitCardItem {
  identifier?: string;
  title: string;
  features?: ScrollSplitFeatureItem[];
  bgColor: string;
  textColor: string;
  borderColor?: string;
  headerIcon?: React.ReactNode;
  accentColor?: string;
}

export interface ScrollSplitCardProps {
  className?: string;
  imageSrc: string;
  cards: ScrollSplitCardItem[];
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function ScrollSplitCard({
  className,
  imageSrc,
  cards,
  containerRef: externalContainerRef,
}: ScrollSplitCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mobile interactive state
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);
  const [mobileFlipped, setMobileFlipped] = useState<boolean>(false);
  const [userTappedIndex, setUserTappedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastScrollProgress = useRef<number>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: externalContainerRef,
    offset: ["start start", "end end"],
  });

  // Mobile scroll watcher to sync cards and flip smoothly
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // If user manually tapped a tab, check if user scrolled away
      if (userTappedIndex !== null) {
        if (Math.abs(latest - lastScrollProgress.current) > 0.08) {
          setUserTappedIndex(null);
        }
      }

      // Flip threshold for mobile
      if (latest >= 0.16) {
        setMobileFlipped(true);
      } else if (latest < 0.10 && userTappedIndex === null) {
        setMobileFlipped(false);
      }

      // Active card index on mobile when driven by scroll
      if (userTappedIndex === null) {
        if (latest < 0.44) {
          setMobileActiveIndex(0);
        } else if (latest < 0.72) {
          setMobileActiveIndex(1);
        } else {
          setMobileActiveIndex(2);
        }
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, userTappedIndex]);

  const activeCardIndex =
    userTappedIndex !== null ? userTappedIndex : mobileActiveIndex;
  const isFlipped = mobileFlipped || userTappedIndex !== null;
  const activeCard = cards[activeCardIndex] || cards[0];

  const handlePillClick = (index: number) => {
    setUserTappedIndex(index);
    setMobileActiveIndex(index);
    setMobileFlipped(true);
    lastScrollProgress.current = scrollYProgress.get();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -45) {
      // Swipe left -> Next card
      const next = Math.min(cards.length - 1, activeCardIndex + 1);
      handlePillClick(next);
    } else if (diff > 45) {
      // Swipe right -> Previous card
      const prev = Math.max(0, activeCardIndex - 1);
      handlePillClick(prev);
    }
    touchStartX.current = null;
  };

  // =========================================================
  // Desktop 3-Panel Transforms:
  // =========================================================
  // Stage 1 to 2: Separation (0.15 to 0.40), Stage 2 to 3: Settle (0.40 to 0.70)
  const leftX = useTransform(
    scrollYProgress,
    [0, 0.15, 0.38, 0.70],
    [0, 0, -32, -16],
  );
  const rightX = useTransform(
    scrollYProgress,
    [0, 0.15, 0.38, 0.70],
    [0, 0, 32, 16],
  );
  const scale = useTransform(scrollYProgress, [0.15, 0.40], [1, 0.95]);

  // Stage 2 to 3: 180° Flip (0.40 to 0.70)
  const rotateY = useTransform(
    scrollYProgress,
    [0.40, 0.70],
    shouldReduceMotion ? [180, 180] : [0, 180],
  );
  const rotateZLeft = useTransform(
    scrollYProgress,
    [0.40, 0.55, 0.70],
    shouldReduceMotion ? [0, 0, 0] : [0, 5, 0],
  );
  const rotateZRight = useTransform(
    scrollYProgress,
    [0.40, 0.55, 0.70],
    shouldReduceMotion ? [0, 0, 0] : [0, -5, 0],
  );

  const borderOpacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 0.25]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.2], [0.35, 0.55]);
  const boxShadow = useMotionTemplate`inset 0 1px 1px rgba(255, 255, 255, ${borderOpacity}), inset 0 -24px 48px rgba(0, 0, 0, ${shadowOpacity}), 0 25px 50px -12px rgba(0, 0, 0, ${shadowOpacity})`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[240vh] md:h-[260vh] w-full bg-[#080808]",
        className,
      )}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [perspective:1400px]">
        {/* ========================================================= */}
        {/* DESKTOP VIEW (md:flex >= 768px): 3 Standalone Obsidian Cards */}
        {/* ========================================================= */}
        <motion.div
          style={{
            scale,
            transformStyle: "preserve-3d",
          }}
          className="hidden md:flex h-[520px] md:h-[560px] lg:h-[600px] w-full max-w-5xl lg:max-w-6xl px-4 sm:px-6 relative items-center justify-center gap-5 sm:gap-6"
        >
          {cards.slice(0, 3).map((card, i) => {
            const isLeft = i === 0;
            const isRight = i === 2;

            return (
              <motion.div
                key={i}
                className="relative h-full flex-1 cursor-pointer select-none"
                style={{
                  x: isLeft ? leftX : isRight ? rightX : 0,
                  rotateY,
                  rotateZ: isLeft ? rotateZLeft : isRight ? rotateZRight : 0,
                  zIndex: i + 1,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Front Side: Full Obsidian Texture Card (No Sliced Columns) */}
                <motion.div
                  className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl [backface-visibility:hidden] flex flex-col justify-between p-6 sm:p-7 md:p-8"
                  style={{
                    zIndex: 2,
                    boxShadow,
                  }}
                >
                  {/* Full Obsidian Texture Background covering each individual card */}
                  <div
                    className="absolute inset-0 h-full w-full pointer-events-none"
                    style={{
                      backgroundImage: `url(${imageSrc})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Dark Vignette Overlay for rich contrast and depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />
                  {/* Subtle glass reflection edge */}
                  <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

                  {/* Front Card Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    {/* Top: Header Icon & Identifier */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white backdrop-blur-md">
                        {card.headerIcon}
                      </div>
                      <span className="text-xs sm:text-sm font-mono tracking-wider font-semibold text-white/80">
                        {card.identifier || `0${i + 1}`}
                      </span>
                    </div>

                    {/* Middle: Clean Minimal Title */}
                    <div className="my-auto py-6">
                      <h3 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-white leading-tight">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>

                {/* Back Side: Minimal Big-Text Feature Card */}
                <motion.div
                  className="absolute inset-0 overflow-hidden rounded-2xl flex flex-col justify-between p-6 sm:p-7 md:p-8 [backface-visibility:hidden] will-change-transform border border-white/15 shadow-2xl"
                  style={{
                    backgroundColor: card.bgColor || "#09090C",
                    color: card.textColor || "#FFFFFF",
                    transform: "rotateY(180deg)",
                    zIndex: 1,
                    boxShadow,
                  }}
                >
                  {/* Obsidian Texture Background Underlay */}
                  <div
                    className="absolute inset-0 h-full w-full pointer-events-none opacity-25 mix-blend-screen"
                    style={{
                      backgroundImage: `url(${imageSrc})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-[#070709]/90 backdrop-blur-md pointer-events-none" />
                  <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

                  {/* Card Content Wrapper */}
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    {/* Top: Header Icon & Identifier */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white">
                        {card.headerIcon}
                      </div>
                      <span className="text-xs sm:text-sm font-mono tracking-wider font-semibold text-white/80">
                        {card.identifier || `0${i + 1}`}
                      </span>
                    </div>

                    {/* Headline in Big Text */}
                    <div className="my-4 shrink-0">
                      <h3 className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold tracking-tight leading-tight text-white">
                        {card.title}
                      </h3>
                    </div>

                    {/* Features in Big Font with Modern Icons */}
                    {card.features && card.features.length > 0 && (
                      <div className="space-y-2.5 sm:space-y-3 my-auto">
                        {card.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/20 transition-colors"
                          >
                            <div className="shrink-0 text-white/90">{feat.icon}</div>
                            <span className="text-sm sm:text-base lg:text-[17px] font-medium tracking-tight text-white leading-tight">
                              {feat.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ========================================================= */}
        {/* MOBILE VIEW (md:hidden < 768px): Dedicated Responsive Deck */}
        {/* ========================================================= */}
        <div className="flex md:hidden flex-col items-center justify-center w-full max-w-[360px] sm:max-w-[420px] px-3 z-10">
          {/* Quick Capability Tabs Pill Navigation */}
          <div className="flex items-center justify-center gap-1.5 p-1 bg-white/[0.06] backdrop-blur-md rounded-full border border-white/10 mb-3 shadow-lg">
            {cards.slice(0, 3).map((c, idx) => {
              const isSelected = activeCardIndex === idx && isFlipped;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePillClick(idx)}
                  className={cn(
                    "px-3 py-1 text-[11px] font-mono font-bold rounded-full transition-all duration-300",
                    isSelected
                      ? "bg-white text-black shadow-md scale-105"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  {idx === 0 ? "01 BRAND" : idx === 1 ? "02 UI/UX" : "03 DEV"}
                </button>
              );
            })}
          </div>

          {/* Interactive 3D Mobile Card */}
          <div
            className="relative w-full h-[490px] sm:h-[530px] [perspective:1200px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
              className="relative w-full h-full"
            >
              {/* Front Side: Full Obsidian Texture */}
              <div
                onClick={() => handlePillClick(0)}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl [backface-visibility:hidden] cursor-pointer bg-black"
                style={{ zIndex: 2 }}
              >
                <img
                  src={imageSrc}
                  alt="ENTROPY Studio - Capabilities"
                  className="w-full h-full object-cover object-center select-none"
                  draggable={false}
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />

                {/* Front Info Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="p-2 rounded-xl bg-white/[0.08] border border-white/15 text-white">
                      {cards[0]?.headerIcon}
                    </div>
                    <span className="text-xs font-mono tracking-wider font-semibold text-white/80">
                      ENTROPY
                    </span>
                  </div>

                  <div className="my-auto py-6">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                      Brand • UI/UX • Technology
                    </h3>
                  </div>
                </div>
              </div>

              {/* Back Side: Minimal Big-Text Feature Card */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl [backface-visibility:hidden] border border-white/15"
                style={{
                  transform: "rotateY(180deg)",
                  zIndex: 1,
                }}
              >
                <div
                  className="absolute inset-0 h-full w-full pointer-events-none opacity-25 mix-blend-screen"
                  style={{
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-[#070709]/92 backdrop-blur-md pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCardIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative z-10 w-full h-full flex flex-col justify-between p-6 rounded-2xl select-none text-white"
                  >
                    {/* Top: Header Icon & Identifier */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                      <div className="p-1.5 rounded-lg bg-white/[0.08] border border-white/12 text-white">
                        {activeCard.headerIcon}
                      </div>
                      <span className="text-xs font-mono tracking-wider font-semibold text-white/80">
                        {activeCard.identifier || `0${activeCardIndex + 1}`}
                      </span>
                    </div>

                    {/* Headline in Big Text */}
                    <div className="my-3 shrink-0">
                      <h3 className="text-2xl sm:text-[26px] font-extrabold tracking-tight leading-tight text-white">
                        {activeCard.title}
                      </h3>
                    </div>

                    {/* Features in Big Font with Modern Icons */}
                    {activeCard.features && activeCard.features.length > 0 && (
                      <div className="space-y-2.5 my-auto">
                        {activeCard.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.06] border border-white/10"
                          >
                            <div className="shrink-0 text-white/90">{feat.icon}</div>
                            <span className="text-sm sm:text-base font-medium tracking-tight text-white leading-tight">
                              {feat.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
