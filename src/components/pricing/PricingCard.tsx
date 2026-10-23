import React from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { PricingPackage } from '../../data/pricingData';
import { GetStartedButton } from '../ui/GetStartedButton';
import { Link } from '../../router/Router';
import styles from './PricingCard.module.css';

interface PricingCardProps {
  pkg: PricingPackage;
  index: number;
  onOpenInquiry?: (serviceName?: string) => void;
}

/**
 * ENTROPY Pricing Card
 * Features:
 * - Slow white light ray travelling continuously along the perimeter
 * - Staggered rotation delay per card index
 * - Low-opacity obsidian glass & brushed graphite background texture
 * - Strict hierarchy: Category Label -> Large Price -> Title & Description -> Divider -> Inclusions -> Dual CTAs
 */
export const PricingCard: React.FC<PricingCardProps> = ({
  pkg,
  index,
  onOpenInquiry,
}) => {
  const staggerClass =
    index % 3 === 0
      ? styles.stagger0
      : index % 3 === 1
      ? styles.stagger1
      : styles.stagger2;

  return (
    <div className={`${styles.cardWrapper} ${staggerClass}`}>
      {/* Moving White Light Ray Beam (Hidden by inner surface except along 1px perimeter) */}
      <div className={styles.borderBeam} aria-hidden="true" />

      {/* Inner Surface with Obsidian Texture */}
      <div className={styles.cardInner}>
        <div className={styles.textureLayer} aria-hidden="true" />
        <div className={styles.textureOverlay} aria-hidden="true" />

        {/* Card Content */}
        <div className={styles.cardContent}>
          {/* Top Row: Category Label & Optional Recommendation Badge */}
          <div className="flex items-center justify-between gap-3 mb-6 min-h-[26px]">
            <span className="text-[11px] font-mono tracking-wider text-[#8E8E93]">
              {pkg.categoryLabel}
            </span>

            {pkg.recommendationLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/20 text-[10px] font-mono tracking-wider text-[#F4F4F2]">
                {pkg.recommendationLabel}
              </span>
            )}
          </div>

          {/* Price Presentation */}
          <div className="mb-5">
            <span className="block text-xs font-mono text-[#8E8E93] tracking-wider mb-1">
              {pkg.pricePrefix}
            </span>
            <div className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-white tracking-tight leading-none font-display">
              {pkg.startingPrice}
            </div>
          </div>

          {/* Package Name & Short Description */}
          <div className="mb-6">
            <h3 className="font-['Rigter',sans-serif] text-xl sm:text-2xl text-white tracking-tight mb-2">
              {pkg.name}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#A1A1A6] font-normal leading-relaxed min-h-[38px]">
              {pkg.description}
            </p>
          </div>

          {/* Thin Divider */}
          <div className="w-full h-[1px] bg-white/[0.08] mb-6" aria-hidden="true" />

          {/* Inclusions List with Checkmarks */}
          <div className="flex-1 mb-8">
            <p className="text-[11px] font-mono tracking-wider text-[#71717A] mb-3">
              Included capabilities:
            </p>
            <ul className="space-y-2.5" aria-label={`${pkg.name} package inclusions`}>
              {pkg.inclusions.map((inclusion, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#D1D1D6]"
                >
                  <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-[#93c5fd]">
                    <Check className="w-2.5 h-2.5 stroke-[2.4]" />
                  </span>
                  <span className="leading-snug">{inclusion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Actions: Primary Start a project & Secondary Details link */}
          <div className="mt-auto pt-5 border-t border-white/[0.08] flex flex-col gap-2.5">
            <GetStartedButton
              onClick={() => onOpenInquiry?.(pkg.serviceName)}
              defaultText="Start a project"
              hoverText="Inquire rate"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="w-full text-xs"
            />

            <Link
              href={`/services/${pkg.serviceSlug}`}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#8E8E93] hover:text-white transition-colors duration-200 py-1"
              aria-label={`View full service details for ${pkg.name}`}
            >
              <span>Details</span>
              <ArrowUpRight className="w-3 h-3 text-[#71717A] group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
