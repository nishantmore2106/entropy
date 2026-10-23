import React, { useEffect } from 'react';
import { useRouter } from '../../router/Router';
import { getServiceBySlug } from '../../data/servicesData';

interface RouteMetaInfo {
  title: string;
  description: string;
}

const ROUTE_METADATA_MAP: Record<string, RouteMetaInfo> = {
  '/': {
    title: 'ENTROPY — Brand, Design & Technology',
    description:
      'An independent creative technology studio engineering brand identities, digital experiences, and scalable products.',
  },
  '/about-us': {
    title: 'About Us — ENTROPY',
    description:
      "Discover ENTROPY's ethos, core principles, and multi-disciplinary creative technology approach.",
  },
  '/about': {
    title: 'About Us — ENTROPY',
    description:
      "Discover ENTROPY's ethos, core principles, and multi-disciplinary creative technology approach.",
  },
  '/works': {
    title: 'Selected Work — ENTROPY',
    description:
      'Explore flagship digital experiences, interactive web platforms, and brand systems engineered by ENTROPY.',
  },
  '/work': {
    title: 'Selected Work — ENTROPY',
    description:
      'Explore flagship digital experiences, interactive web platforms, and brand systems engineered by ENTROPY.',
  },
  '/services': {
    title: 'Services — ENTROPY',
    description:
      'Full-spectrum creative engineering: Brand Identity, UI/UX Systems, Next-Gen Web Development, and Digital Strategy.',
  },
  '/service': {
    title: 'Services — ENTROPY',
    description:
      'Full-spectrum creative engineering: Brand Identity, UI/UX Systems, Next-Gen Web Development, and Digital Strategy.',
  },
  '/contact': {
    title: "Let's Connect — ENTROPY",
    description:
      "Start a project with ENTROPY. Tell us what you're looking to create and let's find the right direction.",
  },
  '/get-started': {
    title: "Let's Connect — ENTROPY",
    description:
      "Start a project with ENTROPY. Tell us what you're looking to create and let's find the right direction.",
  },
  '/inquiry': {
    title: "Let's Connect — ENTROPY",
    description:
      "Start a project with ENTROPY. Tell us what you're looking to create and let's find the right direction.",
  },
  '/admin': {
    title: 'Admin Dashboard — ENTROPY',
    description: 'ENTROPY Studio Private Administration & Project Pipeline Portal.',
  },
  '/admin/login': {
    title: 'Admin Login — ENTROPY',
    description: 'Secure Administrator Authentication Portal.',
  },
  '/admin/enquiries': {
    title: 'Client Enquiries — ENTROPY',
    description: 'Review and manage client project enquiries and scopes.',
  },
  '/admin/email': {
    title: 'Email Activity — ENTROPY Admin',
    description: 'Monitor outbound transactional email queue and delivery activity.',
  },
};

/**
 * RouteMetadata
 * Centralized dynamic document title and Open Graph/SEO metadata manager.
 * Runs on every route transition in the client-side router.
 */
export const RouteMetadata: React.FC = () => {
  const { pathname } = useRouter();

  useEffect(() => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';

    let title = 'ENTROPY — Brand, Design & Technology';
    let description =
      'An independent creative technology studio engineering brand identities, digital experiences, and scalable products.';

    // 1. Direct Route Match
    if (ROUTE_METADATA_MAP[cleanPath]) {
      title = ROUTE_METADATA_MAP[cleanPath].title;
      description = ROUTE_METADATA_MAP[cleanPath].description;
    } else {
      // 2. Service Detail Route Match (/services/:slug or /service/:slug)
      const serviceSlugMatch = cleanPath.match(/^\/(?:services|service)\/([a-zA-Z0-9_-]+)$/);
      if (serviceSlugMatch) {
        const slug = serviceSlugMatch[1];
        const service = getServiceBySlug(slug);
        if (service) {
          title = `${service.name} — ENTROPY`;
          description = service.shortDescription || service.introduction;
        } else {
          title = 'Service Not Found — ENTROPY';
          description = 'The requested service discipline could not be found.';
        }
      } else if (cleanPath.startsWith('/admin/enquiries/')) {
        title = 'Enquiry Details — ENTROPY';
        description = 'Review client project enquiry brief and manage status.';
      } else {
        // 3. Fallback / 404
        title = 'Page Not Found — ENTROPY';
        description = 'The requested page could not be located on ENTROPY Studio.';
      }
    }

    // Update document title
    document.title = title;

    // Helper to safely set or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    // Update or create canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://entropy.studio';
    canonical.setAttribute('href', `${origin}${cleanPath}`);
  }, [pathname]);

  return null;
};

export default RouteMetadata;
