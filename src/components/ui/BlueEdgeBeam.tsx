import React from 'react';
import styles from './BlueEdgeBeam.module.css';

export interface BlueEdgeBeamProps {
  index?: number;
  className?: string;
  idle?: boolean;
}

/**
 * ENTROPY — Dual Flowing Blue Light Lines
 * Two distinct thin light streaks (electric blue & pale cyan) travelling
 * around the perimeter of Works and Services cards on hover and focus.
 */
export const BlueEdgeBeam: React.FC<BlueEdgeBeamProps> = ({
  index = 0,
  className = '',
  idle = false,
}) => {
  const staggerClass =
    index % 3 === 0
      ? styles.stagger0
      : index % 3 === 1
      ? styles.stagger1
      : styles.stagger2;

  return (
    <div
      className={`${styles.beamWrapper} ${staggerClass} ${className}`}
      aria-hidden="true"
    >
      <div className={`${styles.rotatingBeam} ${idle ? styles.idleGlow : ''}`} />
    </div>
  );
};

export default BlueEdgeBeam;
