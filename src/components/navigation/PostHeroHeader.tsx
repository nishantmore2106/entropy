import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { GetStartedButton } from '../ui/GetStartedButton';

interface PostHeroHeaderProps {
  onOpenInquiry: () => void;
}

export const PostHeroHeader: React.FC<PostHeroHeaderProps> = ({ onOpenInquiry }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // The hero section is 100svh. Reveal header only when scrolled past 85% of viewport height
      const threshold = window.innerHeight * 0.85;
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      role="banner"
    >
      <div className="bg-[#0B0B0D]/90 backdrop-blur-md border-b border-[#1E1E24]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="#hero"
            className="text-lg font-bold tracking-tight text-[#F4F4F2] font-display whitespace-nowrap shrink-0 hover:text-white transition-colors"
          >
            {siteConfig.studioName}
          </a>

          {/* Zone 2: Concise page navigation links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#8B8B8B]"
            aria-label="Main Navigation"
          >
            <a
              href="/"
              className="hover:text-[#F4F4F2] transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="/about-us"
              className="hover:text-[#F4F4F2] transition-colors whitespace-nowrap shrink-0"
            >
              About Us
            </a>
            <a
              href="/services"
              className="hover:text-[#F4F4F2] transition-colors whitespace-nowrap shrink-0"
            >
              Services
            </a>
            <a
              href="/works"
              className="hover:text-[#F4F4F2] transition-colors whitespace-nowrap shrink-0"
            >
              Works
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <GetStartedButton
              onClick={onOpenInquiry}
              defaultText="Start a project"
              hoverText="Let's build"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex text-xs"
            />

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#8B8B8B] hover:text-[#F4F4F2] focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0D] border-b border-[#1E1E24] px-6 py-5 shadow-2xl">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#8B8B8B]">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#F4F4F2] py-1 border-b border-[#1A1A20]"
            >
              Home
            </a>
            <a
              href="/about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#F4F4F2] py-1 border-b border-[#1A1A20]"
            >
              About Us
            </a>
            <a
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#F4F4F2] py-1 border-b border-[#1A1A20]"
            >
              Services
            </a>
            <a
              href="/works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#F4F4F2] py-1 border-b border-[#1A1A20]"
            >
              Works
            </a>
            <div className="mt-2 w-full flex justify-center">
              <GetStartedButton
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry();
                }}
                defaultText="Start a project"
                hoverText="Let's build"
                className="w-full text-xs"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
