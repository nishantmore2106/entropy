import React from 'react';
import styles from './GetStartedButton.module.css';
import { Link } from '../../router/Router';
import { trackEvent } from '../../lib/analytics';

export interface GetStartedButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  to?: string;
  href?: string;
  className?: string;
  isCompact?: boolean;
  defaultText?: string;
  hoverText?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  target?: string;
  rel?: string;
}

/**
 * Premium Pearl Button based on Uiverse.io by marcelodolza
 * Refined with scoped CSS, accessible focus states, and dual-state hover typography.
 * Serves as the single source of truth for buttons across the ENTROPY design system.
 */
export const GetStartedButton: React.FC<GetStartedButtonProps> = ({
  onClick,
  to,
  href,
  className = '',
  isCompact = false,
  defaultText = 'Get Started',
  hoverText,
  variant = 'primary',
  type = 'button',
  ariaLabel,
  children,
  icon,
  target,
  rel,
}) => {
  const labelText = children ? children : defaultText;
  const secondaryHover = hoverText || (typeof labelText === 'string' ? labelText : defaultText);
  const baseClass = variant === 'secondary' ? styles.secondary : styles.button;
  const combinedClass = `${baseClass} ${isCompact ? styles.compact : ''} ${className}`;
  const accessibleLabel = ariaLabel || (typeof labelText === 'string' ? labelText : 'Action');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (to === '/contact' || href?.includes('contact') || href?.startsWith('mailto:') || !to) {
      trackEvent('project_enquiry_initiated', {
        label: typeof labelText === 'string' ? labelText : 'CTA Button',
        destination: to || href || 'action',
      });
    }
    if (onClick) {
      onClick(e);
    }
  };

  const content = (
    <div className={styles.wrap}>
      <p>
        <span className="inline-flex items-center gap-2">
          {labelText}
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
        </span>
        <span className="inline-flex items-center gap-2">
          {secondaryHover}
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
        </span>
      </p>
    </div>
  );

  // 1. Router Link
  if (to) {
    return (
      <Link
        href={to}
        onClick={handleClick}
        className={combinedClass}
        aria-label={accessibleLabel}
      >
        {content}
      </Link>
    );
  }

  // 2. Standard external/anchor link
  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    return (
      <a
        href={href}
        onClick={handleClick}
        target={target || (isExternal && !href.startsWith('mailto:') ? '_blank' : undefined)}
        rel={rel || (isExternal && !href.startsWith('mailto:') ? 'noopener noreferrer' : undefined)}
        className={combinedClass}
        aria-label={accessibleLabel}
      >
        {content}
      </a>
    );
  }

  // 3. Button
  return (
    <button
      type={type}
      onClick={handleClick}
      className={combinedClass}
      aria-label={accessibleLabel}
    >
      {content}
    </button>
  );
};

export default GetStartedButton;
