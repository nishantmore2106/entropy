export interface SiteConfig {
  studioName: string;
  tagline: string;
  descriptor: string;
  contactEmail: string;
  phone: string;
  location: string;
  pincode: string;
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

export const siteConfig: SiteConfig = {
  studioName: 'ENTROPY',
  tagline: 'Brand × Design × Technology',
  descriptor: 'An independent creative technology studio engineering identities, digital experiences, and scalable products.',
  contactEmail: 'entropy.helpdesk@gmail.com',
  phone: '+91 9558433430',
  location: 'Vadodara, Gujarat, India',
  pincode: '390007',
  instagram: 'https://instagram.com/entropy.gen',
  instagramHandle: '@entropy.gen',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/entropy.gen' },
    { label: 'X / Twitter', href: 'https://twitter.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'GitHub', href: 'https://github.com' },
  ],
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Services', href: '/services' },
    { label: 'Works', href: '/works' },
  ],
};
