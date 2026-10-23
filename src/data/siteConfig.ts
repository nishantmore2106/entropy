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
  contactEmail: string;
  phone: string;
  location: string;
  pincode: string;
  address: SiteAddress;
  geo: SiteGeoCoordinates;
  priceRange: string;
  openingHours: string;
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
 * Overridable via VITE_SITE_URL environment variable during build/preview.
 */
export const SITE_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SITE_URL as string)) ||
  'https://entropy.design';

export const siteConfig: SiteConfig = {
  studioName: 'ENTROPY',
  legalName: 'ENTROPY Creative Technology Studio',
  tagline: 'Brand × Design × Technology',
  descriptor: 'An independent creative technology studio engineering brand identities, digital experiences, and scalable products.',
  siteUrl: SITE_URL,
  contactEmail: 'entropy.helpdesk@gmail.com',
  phone: '+91 9558433430',
  location: 'Vadodara, Gujarat, India',
  pincode: '390007',
  address: {
    addressLocality: 'Vadodara',
    addressRegion: 'Gujarat',
    postalCode: '390007',
    addressCountry: 'IN',
  },
  geo: {
    latitude: 22.3072,
    longitude: 73.1812,
  },
  priceRange: '₹₹ - ₹₹₹₹',
  openingHours: 'Mo-Fr 09:30-18:30',
  areaServed: ['India', 'Worldwide'],
  instagram: 'https://instagram.com/entropy.gen',
  instagramHandle: '@entropy.gen',
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
