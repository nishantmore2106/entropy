import React from 'react';

export interface BrandIconProps {
  className?: string;
  size?: number;
}

/**
 * Official WhatsApp Icon (Clean, crisp brand mark)
 */
export const WhatsAppIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.25-1.92 1.33-.51.08-1.15.11-3.69-.94-2.18-.9-3.58-3.13-3.69-3.28-.11-.15-.88-1.17-.88-2.23s.55-1.58.75-1.79c.19-.21.42-.26.56-.26.14 0 .28 0 .4.01.13.01.31-.05.48.37.18.43.61 1.48.66 1.59.05.11.08.24.01.38-.07.14-.11.23-.21.35-.11.12-.22.27-.32.36-.11.1-.22.21-.1.42.13.22.56.93 1.21 1.51.83.74 1.54.97 1.76 1.08.22.11.35.1.48-.05.13-.15.56-.65.71-.88.15-.22.3-.18.5-.11.2.07 1.29.61 1.51.72.22.11.37.17.42.26.06.09.06.56-.18 1.24z" />
  </svg>
);

/**
 * Official Figma Icon (Atomic design systems & prototyping)
 */
export const FigmaIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M15.333 7.333V3.667C15.333 1.642 16.975 0 19 0s3.667 1.642 3.667 3.667c0 2.025-1.642 3.666-3.667 3.666h-3.667zm0 1.834h3.667C21.025 9.167 22.667 10.808 22.667 12.833s-1.642 3.667-3.667 3.667h-3.667V9.167zm-7.333-1.834H11.667V0H8C5.975 0 4.333 1.642 4.333 3.667S5.975 7.333 8 7.333zm0 1.834H11.667V16.5H8c-2.025 0-3.667-1.642-3.667-3.667S5.975 9.167 8 9.167zm3.667 9.166v3.667C11.667 24.025 10.025 25.667 8 25.667S4.333 24.025 4.333 22s1.642-3.667 3.667-3.667h3.667z" />
  </svg>
);

/**
 * Official React Icon (Modern frontend applications)
 */
export const ReactIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
  </svg>
);

/**
 * Official Next.js Icon (High-performance web architecture)
 */
export const NextjsIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.828 17.587l-6.845-8.814v8.814H9.429V6.413h1.614l7.086 9.16V6.413h1.554v11.174h-1.855z" />
  </svg>
);

/**
 * Official Framer Icon (Interactive digital experiences)
 */
export const FramerIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
  </svg>
);

/**
 * Official Webflow Icon (Visual web production)
 */
export const WebflowIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M17.848 5.485c-1.397 0-2.458.74-3.084 1.76l-1.996 3.197L10.772 7.24c-.626-1.016-1.687-1.755-3.084-1.755H0v13.03h5.717V12.72l2.368 3.792c.626 1.015 1.687 1.755 3.084 1.755h.063c1.397 0 2.458-.74 3.084-1.755l2.368-3.792v5.795H24V5.485h-6.152z" />
  </svg>
);

/**
 * Official GitHub Icon (Version-controlled deliverables)
 */
export const GitHubIcon: React.FC<BrandIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
