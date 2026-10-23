export interface SiteAddress {
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface SiteGeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface SiteConfig {
  studioName: string;
  legalName: string;
  tagline: string;
  descriptor: string;
  siteUrl: string;
  domainConfirmed: boolean;
  contactEmail: string;
  phone: string;
  location: string;
  pincode: string;
  hasPublicPhysicalOffice: boolean;
  publishExactCoordinates: boolean;
  address: SiteAddress;
  geo?: SiteGeoCoordinates;
  priceRange: string;
  areaServed: string[];
  instagram: string;
  instagramHandle: string;
  socials: {
    label: string;
    href: string;
  }[];
  navigation: {
    label: string;
    href: string;
  }[];
}

/**
 * Authoritative production origin for ENTROPY.
 * NOTE: 'https://entropy.design' is the current project default,
 * but requires final site owner verification before DNS promotion.
 * Overridable via VITE_SITE_URL environment variable during build/preview.
 */
export const SITE_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SITE_URL as string)) ||
  'https://entropy.design';

export const siteConfig: SiteConfig = {
  studioName: 'ENTROPY',
  legalName: 'ENTROPY Creative Technology Studio',
  tagline: 'Brand × Design × Technology',
  descriptor:
    'An independent creative technology studio engineering brand identities, digital experiences, and scalable products.',
  siteUrl: SITE_URL,
  domainConfirmed: false, // Site owner must confirm authoritative domain in production DNS
  contactEmail:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_CONTACT_EMAIL as string)) ||
    'entropy.helpdesk@gmail.com',
  // Verified business contact phone number
  phone:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_STUDIO_PHONE as string)) ||
    '+91 9558433430',
  location: 'Vadodara, Gujarat, India',
  pincode: '390007',
  // ENTROPY operates as an online digital studio serving national and global clients.
  // We do not publish residential or unverified commercial coordinates to avoid misleading LocalBusiness schema.
  hasPublicPhysicalOffice: false,
  publishExactCoordinates: false,
  address: {
    addressLocality: 'Vadodara',
    addressRegion: 'Gujarat',
    postalCode: '390007',
    addressCountry: 'IN',
  },
  priceRange: '₹₹ - ₹₹₹₹',
  areaServed: ['India', 'Worldwide'],
  // Verified official social profile: @entropy.gen
  instagram:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INSTAGRAM_URL as string)) ||
    'https://instagram.com/entropy.gen',
  instagramHandle:
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INSTAGRAM_HANDLE as string)) ||
    '@entropy.gen',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/entropy.gen' },
    { label: 'GitHub', href: 'https://github.com/nishantmore2106/entropy' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'X / Twitter', href: 'https://twitter.com' },
  ],
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Services', href: '/services' },
    { label: 'Works', href: '/works' },
  ],
};
