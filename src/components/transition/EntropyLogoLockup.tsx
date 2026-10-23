import React from 'react';

export interface EntropyLogoLockupProps {
  className?: string;
  showSheen?: boolean;
  sheenRef?: React.RefObject<HTMLDivElement | null>;
  glowRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * ENTROPY Signature Logo Lockup
 * 
 * Pairs the authentic four-slice circular emblem with the official ENTROPY wordmark.
 * Used identically across all three transition panels and the assembled center overlay
 * to guarantee pixel-perfect alignment and zero distortion.
 */
export const EntropyLogoLockup: React.FC<EntropyLogoLockupProps> = ({
  className = '',
  showSheen = false,
  sheenRef,
  glowRef,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Restrained cool blue-white ambient glow highlight */}
      {glowRef && (
        <div
          ref={glowRef}
          className="absolute -inset-12 sm:-inset-16 pointer-events-none -z-10 opacity-0 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56, 189, 248, 0.24) 0%, rgba(14, 165, 233, 0.10) 45%, transparent 75%)',
            filter: 'blur(32px)',
          }}
        />
      )}

      {/* Relative container for emblem + wordmark + metallic sweep */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Authentic 4-slice circular emblem */}
        <div className="w-16 h-16 min-[420px]:w-20 min-[420px]:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center mb-3 sm:mb-4">
          <img
            src="/entropy-symbol.webp"
            alt=""
            className="w-full h-full object-contain filter drop-shadow-[0_2px_18px_rgba(255,255,255,0.14)]"
            width={503}
            height={501}
            loading="eager"
            decoding="sync"
          />
        </div>

        {/* Authentic white ENTROPY wordmark */}
        <div className="w-[240px] min-[420px]:w-[290px] sm:w-[360px] md:w-[440px] lg:w-[500px]">
          <img
            src="/entropy-logo-white.webp"
            alt="ENTROPY"
            className="w-full h-auto object-contain filter drop-shadow-[0_2px_16px_rgba(255,255,255,0.10)]"
            width={1358}
            height={338}
            loading="eager"
            decoding="sync"
          />
        </div>

        {/* Soft metallic light sweep overlay across the assembled brand lockup */}
        {showSheen && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              ref={sheenRef}
              className="absolute -inset-y-4 -left-full w-full pointer-events-none opacity-0"
              style={{
                background:
                  'linear-gradient(110deg, transparent 15%, rgba(255, 255, 255, 0.75) 46%, rgba(56, 189, 248, 0.9) 52%, transparent 80%)',
                mixBlendMode: 'screen',
                willChange: 'transform, opacity',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntropyLogoLockup;
