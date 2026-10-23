import React from 'react';

export interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  softness?: number;
  variant?: 'streak' | 'twin' | 'sheen';
  blendMode?: string;
  rimGlint?: boolean;
  mode?: 'hover' | 'follow' | 'loop' | 'click';
  transitionDuration?: number;
  playOnce?: boolean;
  intro?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare const GlareHover: React.FC<GlareHoverProps>;

export default GlareHover;
export { GlareHover };
