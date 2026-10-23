import React from 'react';

export interface FluxLinesProps {
  colors?: string[];
  speed?: number;
  scale?: number;
  turbulence?: number;
  fluidity?: number;
  rimWidth?: number;
  sharpness?: number;
  shimmer?: number;
  glow?: number;
  lineWidth?: number;
  flowDirection?: 'up' | 'down' | 'left' | 'right';
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  mouseDampening?: number;
  clickSwirl?: boolean;
  intro?: boolean;
  lightMode?: boolean;
  transparent?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

declare const FluxLines: React.FC<FluxLinesProps>;

export default FluxLines;
export { FluxLines };
