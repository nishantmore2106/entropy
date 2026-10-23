import React, { forwardRef } from 'react';
import { EntropyLogoLockup } from './EntropyLogoLockup';

export interface TransitionPanelProps {
  index: 0 | 1 | 2;
  className?: string;
}

/**
 * ENTROPY — Transition Panel
 * 
 * One of the three full-height vertical shutters forming the cinematic page transition.
 * Features:
 * - Equal 1/3 viewport width with 1px overlap (`calc(100vw / 3 + 1px)`) to guarantee zero subpixel gap/seam.
 * - Pitch black (#000000) backdrop.
 * - Viewport-anchored inner canvas that automatically clips the exact 1/3 fragment of the ENTROPY logo.
 * - Leading hairline highlight edge along the advancing boundary in motion.
 */
export const TransitionPanel = forwardRef<HTMLDivElement, TransitionPanelProps>(
  ({ index, className = '' }, ref) => {
    // Exact horizontal offsets for the 3 panels
    const leftPositions = ['0', 'calc(100vw / 3)', 'calc(200vw / 3)'];
    const innerLeftOffsets = ['0', 'calc(-100vw / 3)', 'calc(-200vw / 3)'];

    // Directional visual cues:
    // Panels 0 & 2 enter downwards -> leading edge is at the bottom
    // Panel 1 enters upwards -> leading edge is at the top
    const isUpwardEntering = index === 1;

    return (
      <div
        ref={ref}
        data-panel-index={index}
        aria-hidden="true"
        className={`absolute top-0 bottom-0 overflow-hidden bg-[#000000] select-none pointer-events-none will-change-transform z-10 ${className}`}
        style={{
          left: leftPositions[index],
          width: 'calc(100vw / 3 + 1px)',
          height: '100vh',
        }}
      >
        {/* Leading edge light streak while in motion */}
        {isUpwardEntering ? (
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />
        ) : (
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
        )}

        {/* 
          Viewport-anchored inner container:
          Always 100vw x 100vh, offset horizontally so the logo is positioned identically
          in global viewport coordinates. The panel's overflow-hidden naturally clips its exact slice!
        */}
        <div
          className="absolute top-0 flex items-center justify-center pointer-events-none"
          style={{
            left: innerLeftOffsets[index],
            width: '100vw',
            height: '100vh',
          }}
        >
          <EntropyLogoLockup />
        </div>
      </div>
    );
  }
);

TransitionPanel.displayName = 'TransitionPanel';

export default TransitionPanel;
