import React from 'react';
import { VoxelArcHero } from './VoxelArcHero/VoxelArcHero';

interface HeroPlaceholderProps {
  onOpenInquiry?: (serviceName?: string) => void;
}

/**
 * ENTROPY Hero Section
 * Powered by React Bits Pro Voxel Arc component.
 * Rolling curved horizon of square voxels on a pure black background.
 */
export const HeroPlaceholder: React.FC<HeroPlaceholderProps> = ({
  onOpenInquiry = () => {},
}) => {
  return (
    <VoxelArcHero
      onOpenInquiry={onOpenInquiry}
    />
  );
};

export { VoxelArcHero };
