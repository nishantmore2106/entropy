import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  heading,
  description,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`mb-12 md:mb-16 ${
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'
      } ${className}`}
    >
      {eyebrow && (
        <div className="flex items-center gap-2 mb-3 text-xs tracking-wider font-mono text-[#8B8B8B]">
          <span>{eyebrow}</span>
          <span className="w-8 h-[1px] bg-[#27272A]" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-[#F4F4F2] text-balance">
        {heading}
      </h2>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-[#8B8B8B] leading-relaxed max-w-2xl text-pretty font-normal">
          {description}
        </p>
      )}
    </div>
  );
};
