import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ENTROPY — Cinematic Diagonal Rainbow Light Streaks Background
 * 
 * Accurately reproduces the visual reference:
 * - Pure pitch-black canvas (#000000)
 * - Two distinct diagonal prismatic spectral light streaks slicing across the composition (~-35deg to -38deg angle)
 * - Rich spectral chromatic dispersion: deep violet, royal blue, electric cyan core, emerald green, and golden amber
 * - Luminous optic blur (~45px - 65px) preserving distinct color separation without turning into muddy haze
 * - Gentle, ultra-slow floating drift (disabled on prefers-reduced-motion)
 * - Preserves high-contrast readability behind text and form fields
 */
export const PrismaticBeams: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* 1. Deep Pitch Black Canvas */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* 
        ========================================================================
        2. PRIMARY UPPER-RIGHT DIAGONAL PRISMATIC SPECTRUM BEAM
        Passes diagonally behind "Connect" and the right contact card down toward mid-left
        ========================================================================
      */}
      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
                x: [-15, 20, -15],
                y: [10, -20, 10],
                rotate: [-35, -38, -35],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -right-[15%] -top-[20%] w-[130%] h-[160%] origin-center pointer-events-none"
        style={{
          transform: 'rotate(-36deg)',
          willChange: 'transform',
        }}
      >
        {/* Full spectral dispersion band (Violet -> Blue -> Cyan -> Green -> Yellow) */}
        <div
          className="absolute right-[28%] top-[-10%] w-[320px] sm:w-[420px] lg:w-[480px] h-[150%] opacity-85"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.45) 10%, rgba(59, 130, 246, 0.85) 26%, rgba(6, 182, 212, 0.95) 44%, rgba(52, 211, 153, 0.75) 62%, rgba(250, 204, 21, 0.55) 78%, rgba(249, 115, 22, 0.25) 90%, transparent 100%)',
            filter: 'blur(52px)',
          }}
        />

        {/* High-luminescence electric cyan-white laser core (gives the beam its optical brilliance) */}
        <div
          className="absolute right-[33%] top-[0%] w-[140px] sm:w-[180px] lg:w-[220px] h-[140%] opacity-90"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.5) 25%, rgba(240, 253, 255, 0.98) 50%, rgba(14, 165, 233, 0.5) 75%, transparent 100%)',
            filter: 'blur(32px)',
          }}
        />

        {/* Deep ambient violet-indigo halo */}
        <div
          className="absolute right-[22%] top-[-5%] w-[380px] sm:w-[480px] h-[140%] opacity-40"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.6) 30%, rgba(99, 102, 241, 0.4) 60%, transparent 100%)',
            filter: 'blur(75px)',
          }}
        />
      </motion.div>

      {/* 
        ========================================================================
        3. SECONDARY LOWER DIAGONAL PRISMATIC BEAM
        Passes diagonally behind the lower form (textarea & budget grid) toward bottom right
        ========================================================================
      */}
      <motion.div
        animate={
          shouldReduceMotion
            ? false
            : {
                x: [15, -15, 15],
                y: [-12, 16, -12],
                rotate: [-34, -37, -34],
                opacity: [0.7, 0.9, 0.7],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -left-[10%] top-[35%] w-[120%] h-[130%] origin-center pointer-events-none"
        style={{
          transform: 'rotate(-35deg)',
          willChange: 'transform',
        }}
      >
        {/* Soft lower rainbow streak */}
        <div
          className="absolute left-[32%] top-[0%] w-[280px] sm:w-[380px] h-[130%] opacity-75"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.45) 15%, rgba(14, 165, 233, 0.75) 38%, rgba(6, 182, 212, 0.85) 52%, rgba(16, 185, 129, 0.5) 70%, rgba(245, 158, 11, 0.3) 85%, transparent 100%)',
            filter: 'blur(58px)',
          }}
        />

        {/* Bright blue-cyan accent slice */}
        <div
          className="absolute left-[36%] top-[10%] w-[120px] sm:w-[160px] h-[110%] opacity-80"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.4) 20%, rgba(224, 242, 254, 0.9) 50%, rgba(14, 165, 233, 0.4) 80%, transparent 100%)',
            filter: 'blur(36px)',
          }}
        />
      </motion.div>

      {/* 
        ========================================================================
        4. CONTRAST PRESERVATION RADIAL VIGNETTE
        Keeps form inputs and text 100% crisp while letting the rainbow beams
        glow around the card perimeters and in the negative space.
        ========================================================================
      */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 38% 52%, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%)',
        }}
      />

      {/* Edge falloff to pure pitch black */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#000000] via-[#000000]/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent pointer-events-none" />
    </div>
  );
};

export default PrismaticBeams;
