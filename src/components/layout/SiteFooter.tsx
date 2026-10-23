import React from 'react';
import { ScrollReveal } from '../common/ScrollReveal';
import { useRouter } from '../../router/Router';
import { trackEvent } from '../../lib/analytics';

export interface SiteFooterProps {
  onOpenInquiry?: () => void;
  className?: string;
}

/**
 * ENTROPY — Reusable Shared Global Cinematic Footer
 * Standardized across Home, About Us, Works, Services, and Service Detail pages.
 * 
 * Aesthetic:
 * - Pure-black canvas (#000000)
 * - Faint digital matrix raster & horizontal silver-blue light field
 * - Left descriptor & right understated navigation
 * - Oversized authentic white ENTROPY brand logo centerpiece
 * - Thin graphite divider & bottom legal/discipline metadata
 * - Safe bottom padding preventing overlap with floating MagneticDock
 */
export const SiteFooter: React.FC<SiteFooterProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  const currentYear = 2026;
  const { pathname, navigate } = useRouter();

  const handleNavClick = (targetPath: string, hashOnHome?: string) => {
    if (pathname === '/' && hashOnHome) {
      const el = document.getElementById(hashOnHome);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(targetPath);
  };

  return (
    <footer
      id="studio-footer"
      role="contentinfo"
      aria-label="ENTROPY Studio Footer"
      className={`relative w-full bg-[#000000] text-[#F4F4F2] overflow-hidden select-none isolate ${className}`}
    >
      {/* 
        ========================================================================
        1. BACKGROUND ATMOSPHERE: Subtle Digital Matrix & Horizontal Light Streak
        ========================================================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
        {/* Soft top gradient blend transition into dark background */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-10" />

        {/* Digital Modular Matrix Grid with Micro-Dotted Texture */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07] mix-blend-screen"
          aria-hidden="true"
        >
          <defs>
            <pattern id="site-footer-micro-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.9" fill="#FFFFFF" opacity="0.6" />
              <circle cx="14" cy="14" r="0.7" fill="#38BDF8" opacity="0.4" />
            </pattern>
            <pattern id="site-footer-matrix-grid" width="140" height="80" patternUnits="userSpaceOnUse">
              <rect width="140" height="80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
              <rect x="0" y="0" width="140" height="80" fill="url(#site-footer-micro-dots)" opacity="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#site-footer-matrix-grid)" />
        </svg>

        {/* Ambient Deep-Blue / Cyan Radial Glow behind the central logo area */}
        <div
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1300px] h-[220px] sm:h-[300px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(14, 116, 204, 0.24) 0%, rgba(2, 56, 110, 0.12) 40%, rgba(0, 0, 0, 0) 75%)',
            filter: 'blur(35px)',
          }}
        />

        {/* Primary Horizontal Silver-Blue Light Beam */}
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-[1400px] h-[2.5px] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(14, 116, 204, 0) 8%, rgba(56, 189, 248, 0.45) 28%, rgba(224, 242, 254, 0.95) 50%, rgba(56, 189, 248, 0.45) 72%, rgba(14, 116, 204, 0) 92%, transparent 100%)',
            boxShadow:
              '0 0 18px 3px rgba(56, 189, 248, 0.45), 0 0 45px 8px rgba(14, 116, 204, 0.25)',
          }}
        />

        {/* Secondary Delicate Micro-Streak for Cinematic Depth */}
        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-[960px] h-[1px] pointer-events-none opacity-40"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.2) 25%, rgba(255, 255, 255, 0.65) 50%, rgba(56, 189, 248, 0.2) 75%, transparent 100%)',
          }}
        />

        {/* Vignette Gradients: Keep edges and bottom pure pitch-black */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-transparent via-15% to-[#000000] to-85% pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/40 via-transparent via-20% to-[#000000] to-90% pointer-events-none" />
      </div>

      {/* 
        ========================================================================
        2. FOREGROUND CONTENT CONTAINER
        ========================================================================
      */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-between min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] pt-12 sm:pt-16 pb-[calc(92px+env(safe-area-inset-bottom,0px))] md:pb-8">
        {/* Top Information Row */}
        <ScrollReveal yOffset={16}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8 pt-2">
            {/* Left: Concise Studio Descriptor */}
            <div className="max-w-[380px] sm:max-w-[420px]">
              <p className="text-xs sm:text-[13.5px] text-[#A1A1A6] font-normal leading-relaxed">
                An independent creative technology studio shaping brands and digital experiences through strategy, design, and technology.
              </p>
            </div>

            {/* Right: Understated Navigation Links */}
            <nav aria-label="Studio Quick Navigation">
              <ul className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-[13px] font-mono tracking-wider text-[#8E8E93]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('project_enquiry_initiated', { source: 'footer_contact_link' });
                      if (onOpenInquiry) onOpenInquiry();
                    }}
                    className="hover:text-white transition-colors duration-200 cursor-pointer uppercase text-left"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/works', 'selected-work')}
                    className="hover:text-white transition-colors duration-200 uppercase cursor-pointer text-left"
                  >
                    Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/services', 'services')}
                    className="hover:text-white transition-colors duration-200 uppercase cursor-pointer text-left"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/about-us', 'about')}
                    className="hover:text-white transition-colors duration-200 uppercase cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </ScrollReveal>

        {/* 
          ======================================================================
          3. CENTERPIECE: Enormous White ENTROPY Logo Artwork
          ======================================================================
        */}
        <ScrollReveal yOffset={24}>
          <div className="w-full flex items-center justify-center my-8 sm:my-12 lg:my-14 overflow-hidden">
            <img
              src="/entropy-logo-white.webp"
              alt="ENTROPY"
              className="w-[92%] sm:w-[94%] max-w-[1360px] h-auto object-contain select-none pointer-events-none filter drop-shadow-[0_4px_24px_rgba(255,255,255,0.06)]"
              loading="lazy"
              width={1358}
              height={338}
            />
          </div>
        </ScrollReveal>

        {/* 
          ======================================================================
          4. BOTTOM INFORMATION ROW: Thin Divider, Copyright, Discipline, & Legal
          ======================================================================
        */}
        <div className="pt-4 sm:pt-6 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs font-mono text-[#71717A]">
            {/* Left group */}
            <div className="text-center sm:text-left">
              © {currentYear} ENTROPY. All rights reserved.
            </div>

            {/* Center group */}
            <div className="text-center text-[#8E8E93] font-medium tracking-wide">
              Brand × Design × Technology
            </div>

            {/* Right group */}
            <div className="flex items-center gap-5 text-center sm:text-right">
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    'Terms of Service: ENTROPY Studio (2026). All custom deliverables, source code, and design assets are 100% client-owned upon project completion.'
                  );
                }}
                className="hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Terms of Service
              </a>
              <span aria-hidden="true" className="text-white/20 select-none">
                ·
              </span>
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    'Privacy Policy: ENTROPY respects client confidentiality and collects zero telemetry or third-party tracking.'
                  );
                }}
                className="hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
