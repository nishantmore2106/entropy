import React from 'react';
import { Mail, MapPin, Phone, Instagram } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import {
  WhatsAppIcon,
  FigmaIcon,
  ReactIcon,
  NextjsIcon,
  FramerIcon,
  WebflowIcon,
  GitHubIcon,
} from '../common/BrandIcons';

import { trackEvent } from '../../lib/analytics';

export const ContactInfoPanel: React.FC = () => {
  return (
    <aside
      aria-label="Studio Direct Contact Information"
      className="w-full bg-[#07090E]/85 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 font-sans"
    >
      {/* Primary Contact Rows */}
      <div className="space-y-5">
        {/* Row 1: Official Email */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/90">
            <Mail className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8E8E93]">
              Direct Email
            </span>
          </div>
          <a
            href={`mailto:${siteConfig.contactEmail}?subject=Project%20Enquiry%20%E2%80%94%20ENTROPY`}
            onClick={() => trackEvent('email_contact_clicked', { source: 'contact_panel' })}
            className="block text-xs sm:text-[13.5px] font-mono text-white/95 hover:text-sky-300 transition-colors break-all"
          >
            {siteConfig.contactEmail}
          </a>
        </div>

        {/* Row 2: Confirmed Phone / WhatsApp */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/90">
            <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8E8E93]">
              Phone / WhatsApp
            </span>
          </div>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
            onClick={() => trackEvent('phone_contact_clicked', { source: 'contact_panel', channel: 'tel' })}
            className="block text-xs sm:text-[13.5px] font-mono text-white/95 hover:text-emerald-300 transition-colors"
          >
            {siteConfig.phone}
          </a>
          <span className="block text-[10.5px] font-mono text-[#8E8E93]">
            Direct principal communication
          </span>
        </div>

        {/* Row 3: Studio Location & PIN */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8E8E93]">
              Studio Location
            </span>
          </div>
          <p className="text-xs sm:text-[13.5px] font-sans text-white/95">
            {siteConfig.location} — {siteConfig.pincode}
          </p>
          <span className="block text-[10.5px] font-mono text-[#8E8E93]">
            Working globally across timezones
          </span>
        </div>

        {/* Row 4: Instagram */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/90">
            <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8E8E93]">
              Instagram
            </span>
          </div>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs sm:text-[13.5px] font-mono text-white/95 hover:text-pink-300 transition-colors"
          >
            {siteConfig.instagramHandle}
          </a>
        </div>
      </div>

      {/* Part 5: Core Platforms & Brand Ecosystem */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
        <span className="block text-[10.5px] font-mono tracking-wider uppercase text-[#7E7E86]">
          Deliverable Ecosystem
        </span>
        <div className="flex items-center gap-3 text-white/50">
          <span title="Figma Design Systems & Prototypes" className="hover:text-white transition-colors">
            <FigmaIcon className="w-4 h-4" />
          </span>
          <span title="React Modern Frontend" className="hover:text-white transition-colors">
            <ReactIcon className="w-4 h-4" />
          </span>
          <span title="Next.js Production Architecture" className="hover:text-white transition-colors">
            <NextjsIcon className="w-4 h-4" />
          </span>
          <span title="Framer Interactive Digital Sites" className="hover:text-white transition-colors">
            <FramerIcon className="w-4 h-4" />
          </span>
          <span title="Webflow Visual Web Production" className="hover:text-white transition-colors">
            <WebflowIcon className="w-4 h-4" />
          </span>
          <span title="GitHub Version Control" className="hover:text-white transition-colors">
            <GitHubIcon className="w-4 h-4" />
          </span>
        </div>
      </div>
    </aside>
  );
};

export default ContactInfoPanel;
