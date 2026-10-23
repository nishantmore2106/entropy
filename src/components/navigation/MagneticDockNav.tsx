import React, { useState, useEffect, useCallback } from 'react';
import {
  MagneticDock,
  DockItemData,
  DockIconHome,
  DockIconAbout,
  DockIconBriefcase,
  DockIconLayers,
} from '../ui/magnetic-dock';
import { GetStartedButton } from '../ui/GetStartedButton';
import { useRouter } from '../../router/Router';

/**
 * Our studio pages navigation destinations:
 * Home -> /
 * About Us -> /about-us
 * Services -> /services
 * Works -> /works
 */
const NAV_DESTINATIONS = [
  { path: '/', href: '/', label: 'Home', Icon: DockIconHome, id: 'home' },
  { path: '/about-us', href: '/about-us', label: 'About Us', Icon: DockIconAbout, id: 'about-us' },
  { path: '/works', href: '/works', label: 'Work', Icon: DockIconBriefcase, id: 'works' },
  { path: '/services', href: '/services', label: 'Services', Icon: DockIconLayers, id: 'services' },
] as const;

interface MagneticDockNavProps {
  onOpenInquiry?: () => void;
  className?: string;
}

export const MagneticDockNav: React.FC<MagneticDockNavProps> = ({
  onOpenInquiry,
  className = '',
}) => {
  const { pathname, navigate } = useRouter();
  const [activeItem, setActiveItem] = useState<string>('home');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Track viewport breakpoint to seamlessly swap navigation layout
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  // Sync active dock item with current route
  useEffect(() => {
    const clean = pathname.replace(/\/+$/, '') || '/';
    if (clean === '/about-us' || clean === '/about') {
      setActiveItem('about-us');
      return;
    }
    if (clean === '/services' || clean === '/service' || clean.startsWith('/services/') || clean.startsWith('/service/')) {
      setActiveItem('services');
      return;
    }
    if (clean === '/works' || clean === '/work') {
      setActiveItem('works');
      return;
    }
    setActiveItem('home');
  }, [pathname]);

  const normalizePath = (p: string) => {
    const clean = p.replace(/\/+$/, '') || '/';
    if (clean === '/about') return '/about-us';
    if (clean === '/work') return '/works';
    if (clean === '/service') return '/services';
    return clean;
  };

  const handleNavClick = useCallback(
    (path: string, id: string) => {
      const cleanPath = normalizePath(path);
      const cleanCurrent = normalizePath(pathname);

      if (cleanPath === '/') {
        if (cleanCurrent === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveItem('home');
        } else {
          navigate('/');
        }
        return;
      }

      // If user clicks the currently active page, scroll up to top smoothly
      if (cleanCurrent === cleanPath) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Direct page navigation for Work, Services, About Us
      navigate(path);
    },
    [pathname, navigate]
  );

  const dockItems: DockItemData[] = NAV_DESTINATIONS.map(({ path, href, label, Icon, id }) => ({
    id,
    label,
    href,
    icon: <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />,
    isActive: activeItem === id,
    onClick: () => handleNavClick(path, id),
  }));

  return (
    <>
      {/* 
        Fixed Navbar Header (Desktop & Mobile Top Row)
        - Left: Brand Logo from public/Artboard 7 copy 3@2x.png
        - Center: Viewport-centered MagneticDock with our studio pages (desktop only)
        - Right: Premium Get Started Pearl Button
      */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none w-full transition-all duration-300 ${className}`}
        aria-label="Main Navigation"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-5 flex items-center justify-between relative">
          {/* Left: Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('/', 'home')}
            className="pointer-events-auto relative z-20 flex items-center shrink-0 transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-0.5"
            aria-label="ENTROPY Studio Home"
          >
            <img
              src="/Artboard 7 copy 3@2x.png"
              alt="ENTROPY"
              className="h-6 sm:h-7 md:h-8 w-auto object-contain select-none"
              draggable={false}
            />
          </button>

          {/* 
            Center: MagneticDock with our pages (Desktop only)
            Strictly centered in the viewport via absolute positioning!
          */}
          {!isMobile && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
              <MagneticDock
                items={dockItems}
                iconSize={44}
                maxScale={1.35}
                magneticDistance={140}
                showLabels={true}
                position="top"
                variant="glass"
              />
            </div>
          )}

          {/* Right: Pearl 'Get Started' Button */}
          <div className="pointer-events-auto relative z-20 flex items-center justify-end shrink-0">
            <GetStartedButton
              onClick={onOpenInquiry}
              isCompact={isMobile}
              defaultText="Get Started"
              hoverText="Let's Talk"
            />
          </div>
        </div>
      </header>

      {/* 
        Mobile Fixed Bottom Magnetic Dock:
        Pinned to bottom center of viewport with safe-area padding.
        Only rendered when on mobile screens (isMobile === true).
      */}
      {isMobile && (
        <aside
          className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-16px)] bottom-[calc(12px+env(safe-area-inset-bottom,0px))]"
          aria-label="Mobile Navigation Dock"
        >
          <MagneticDock
            items={dockItems}
            iconSize={36}
            maxScale={1.2}
            magneticDistance={90}
            showLabels={true}
            position="bottom"
            variant="glass"
            className="p-1.5 gap-1.5 sm:gap-2 border-white/[0.1] bg-[#0c0d12]/85 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
          />
        </aside>
      )}
    </>
  );
};

export default MagneticDockNav;
