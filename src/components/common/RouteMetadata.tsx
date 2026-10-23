import React, { useEffect } from 'react';
import { useRouter } from '../../router/Router';
import { getServiceBySlug } from '../../data/servicesData';
import { SITE_URL, siteConfig } from '../../data/siteConfig';
import { defaultEntropyFaqs } from '../ui/faq-9';
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  buildFAQSchema,
} from '../../lib/seo';

interface RouteMetaInfo {
  title: string;
  description: string;
  canonicalPath: string;
  pageType?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage';
}

const ROUTE_METADATA_MAP: Record<string, RouteMetaInfo> = {
  '/': {
    title: 'ENTROPY — Creative Technology Studio | Brand, Design & Technology',
    description:
      'Independent creative technology studio engineering brand identities, digital flagship experiences, and scalable web platforms for ambitious companies worldwide.',
    canonicalPath: '/',
    pageType: 'WebPage',
  },
  '/about-us': {
    title: 'About Us — Ethos & Principles | ENTROPY Studio',
    description:
      "Learn about ENTROPY's multidisciplinary ethos. We combine strategic clarity, visual precision, and modern frontend engineering to create purposeful digital products.",
    canonicalPath: '/about-us',
    pageType: 'AboutPage',
  },
  '/about': {
    title: 'About Us — Ethos & Principles | ENTROPY Studio',
    description:
      "Learn about ENTROPY's multidisciplinary ethos. We combine strategic clarity, visual precision, and modern frontend engineering to create purposeful digital products.",
    canonicalPath: '/about-us',
    pageType: 'AboutPage',
  },
  '/works': {
    title: 'Selected Work & Digital Case Studies | ENTROPY Studio',
    description:
      'Explore flagship digital experiences, interactive web applications, e-commerce storefronts, and brand design systems engineered by ENTROPY.',
    canonicalPath: '/works',
    pageType: 'CollectionPage',
  },
  '/work': {
    title: 'Selected Work & Digital Case Studies | ENTROPY Studio',
    description:
      'Explore flagship digital experiences, interactive web applications, e-commerce storefronts, and brand design systems engineered by ENTROPY.',
    canonicalPath: '/works',
    pageType: 'CollectionPage',
  },
  '/services': {
    title: 'Services & Capabilities — Brand, Design & Web Engineering | ENTROPY',
    description:
      "Explore ENTROPY's core capabilities across brand identity, UI/UX systems, custom website development, e-commerce, and motion interaction design.",
    canonicalPath: '/services',
    pageType: 'CollectionPage',
  },
  '/service': {
    title: 'Services & Capabilities — Brand, Design & Web Engineering | ENTROPY',
    description:
      "Explore ENTROPY's core capabilities across brand identity, UI/UX systems, custom website development, e-commerce, and motion interaction design.",
    canonicalPath: '/services',
    pageType: 'CollectionPage',
  },
  '/contact': {
    title: 'Start a Project — Contact ENTROPY Studio',
    description:
      "Tell us what you're building. Connect directly with ENTROPY to discuss your brand identity, website redesign, or digital product requirements.",
    canonicalPath: '/contact',
    pageType: 'ContactPage',
  },
  '/get-started': {
    title: 'Start a Project — Contact ENTROPY Studio',
    description:
      "Tell us what you're building. Connect directly with ENTROPY to discuss your brand identity, website redesign, or digital product requirements.",
    canonicalPath: '/contact',
    pageType: 'ContactPage',
  },
  '/inquiry': {
    title: 'Start a Project — Contact ENTROPY Studio',
    description:
      "Tell us what you're building. Connect directly with ENTROPY to discuss your brand identity, website redesign, or digital product requirements.",
    canonicalPath: '/contact',
    pageType: 'ContactPage',
  },
  '/admin': {
    title: 'Admin Dashboard — ENTROPY',
    description: 'ENTROPY Studio Private Administration & Project Pipeline Portal.',
    canonicalPath: '/admin',
    pageType: 'WebPage',
  },
  '/admin/login': {
    title: 'Admin Login — ENTROPY',
    description: 'Secure Administrator Authentication Portal.',
    canonicalPath: '/admin/login',
    pageType: 'WebPage',
  },
  '/admin/enquiries': {
    title: 'Client Enquiries — ENTROPY',
    description: 'Review and manage client project enquiries and scopes.',
    canonicalPath: '/admin/enquiries',
    pageType: 'WebPage',
  },
  '/admin/email': {
    title: 'Email Activity — ENTROPY Admin',
    description: 'Monitor outbound transactional email queue and delivery activity.',
    canonicalPath: '/admin/email',
    pageType: 'WebPage',
  },
};

/**
 * Service metadata map for all 10 core studio disciplines.
 */
const SERVICE_META_MAP: Record<string, { title: string; description: string }> = {
  'brand-identity': {
    title: 'Brand Identity Design & Visual Systems | ENTROPY Studio',
    description:
      'We build cohesive brand identity systems—from adaptive logo architectures and typographic hierarchies to digital-first design tokens and comprehensive brand guidelines.',
  },
  'brand-strategy': {
    title: 'Brand Strategy & Market Positioning | ENTROPY Studio',
    description:
      'Define your brand positioning, core differentiation, and communicative principles with strategic clarity that guides design systems and business growth.',
  },
  'logo-design': {
    title: 'Custom Logo Design & Symbol Systems | ENTROPY Studio',
    description:
      'We design memorable, geometrically balanced logo systems and wordmarks engineered for instant recognition across digital displays and physical touchpoints.',
  },
  'ui-ux-design': {
    title: 'UI/UX Design & Digital Product Systems | ENTROPY Studio',
    description:
      'We transform complex capabilities into intuitive digital experiences with user research, atomic design systems, interactive prototypes, and validated journeys.',
  },
  'website-design': {
    title: 'Custom Website Design & Digital Art Direction | ENTROPY Studio',
    description:
      'Bespoke website art direction balancing cinematic visual expression with responsive usability, spatial rhythm, and developer-ready architectural handoff.',
  },
  'website-development': {
    title: 'Custom Website Development & Modern Engineering | ENTROPY Studio',
    description:
      'We engineer high-performance, responsive websites using modern standards, modular codebases, sub-second load times, and clean technical SEO foundations.',
  },
  'ecommerce-development': {
    title: 'E-commerce Website Design & Storefront Development | ENTROPY',
    description:
      'Considered digital commerce storefronts connecting high-resolution product storytelling, frictionless checkout flows, and lightning-fast browsing speeds.',
  },
  'landing-pages': {
    title: 'Landing Page Design & Campaign Microsites | ENTROPY Studio',
    description:
      'Focused campaign destinations crafted to communicate value with immediate resonance, narrative pacing, and decisive conversion actions.',
  },
  'motion-interaction-design': {
    title: 'Motion & Interaction Design | ENTROPY Studio',
    description:
      'We craft purposeful motion, physics-based transitions, and kinetic details that give digital experiences emotional resonance without compromising speed.',
  },
  'digital-product-development': {
    title: 'Digital Product Development & MVP Engineering | ENTROPY Studio',
    description:
      'We partner with founders to shape concepts into production-ready digital products with scalable frontend architecture, API integration, and modular UI.',
  },
};

/**
 * RouteMetadata
 * Centralized dynamic document title, Open Graph, Twitter card, Canonical,
 * and JSON-LD structured data manager. Runs on every route transition.
 */
export const RouteMetadata: React.FC = () => {
  const { pathname } = useRouter();

  useEffect(() => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    const isAdmin = cleanPath.startsWith('/admin');

    let title = 'ENTROPY — Creative Technology Studio | Brand, Design & Technology';
    let description = siteConfig.descriptor;
    let canonicalPath = cleanPath;
    let pageType: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage' = 'WebPage';
    let currentServiceSlug: string | null = null;

    // 1. Check exact match in static route metadata
    if (ROUTE_METADATA_MAP[cleanPath]) {
      const match = ROUTE_METADATA_MAP[cleanPath];
      title = match.title;
      description = match.description;
      canonicalPath = match.canonicalPath;
      pageType = match.pageType || 'WebPage';
    } else {
      // 2. Service Detail Route Match (/services/:slug or /service/:slug)
      const serviceSlugMatch = cleanPath.match(/^\/(?:services|service)\/([a-zA-Z0-9_-]+)$/);
      if (serviceSlugMatch) {
        const slug = serviceSlugMatch[1];
        const service = getServiceBySlug(slug);
        if (service) {
          currentServiceSlug = service.slug;
          canonicalPath = `/services/${service.slug}`;
          pageType = 'WebPage';
          if (SERVICE_META_MAP[service.slug]) {
            title = SERVICE_META_MAP[service.slug].title;
            description = SERVICE_META_MAP[service.slug].description;
          } else {
            title = `${service.name} — ENTROPY Studio`;
            description = service.shortDescription || service.introduction;
          }
        } else {
          title = 'Service Not Found — ENTROPY Studio';
          description = 'The requested service discipline could not be located.';
        }
      } else if (cleanPath.startsWith('/admin/enquiries/')) {
        title = 'Enquiry Details — ENTROPY Admin';
        description = 'Review client project enquiry brief and manage status.';
      } else {
        // 3. Fallback / 404
        title = 'Page Not Found — ENTROPY Studio';
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

    // Standard SEO Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag(
      'meta[name="robots"]',
      'name',
      'robots',
      isAdmin ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Open Graph Metadata
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
    const socialImage = `${SITE_URL}/Artboard%205%402x.png`;

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteConfig.studioName);
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', socialImage);
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'ENTROPY — Creative Technology Studio Emblem');
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');

    // Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', siteConfig.instagramHandle);

    // Canonical link tag (Always bound to authoritative production SITE_URL)
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // ─────────────────────────────────────────────────────────────────────────
    // DYNAMIC JSON-LD STRUCTURED DATA INJECTION
    // ─────────────────────────────────────────────────────────────────────────
    if (!isAdmin) {
      const schemas: Record<string, unknown>[] = [
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema(canonicalPath, title, description, pageType),
      ];

      // Add Breadcrumb schema for non-home routes
      if (canonicalPath !== '/') {
        if (currentServiceSlug) {
          const service = getServiceBySlug(currentServiceSlug);
          if (service) {
            schemas.push(
              buildBreadcrumbSchema([
                { name: 'Home', url: '/' },
                { name: 'Services', url: '/services' },
                { name: service.name, url: `/services/${service.slug}` },
              ])
            );
            schemas.push(buildServiceSchema(service));
          }
        } else if (canonicalPath === '/about-us') {
          schemas.push(
            buildBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'About Us', url: '/about-us' },
            ])
          );
        } else if (canonicalPath === '/works') {
          schemas.push(
            buildBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Selected Work', url: '/works' },
            ])
          );
        } else if (canonicalPath === '/services') {
          schemas.push(
            buildBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Services', url: '/services' },
            ])
          );
        } else if (canonicalPath === '/contact') {
          schemas.push(
            buildBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Contact', url: '/contact' },
            ])
          );
        }
      } else {
        // On Homepage, inject verified FAQ schema
        schemas.push(buildFAQSchema(defaultEntropyFaqs));
      }

      // Inject or replace structured data script in head
      let scriptTag = document.getElementById('entropy-schema-jsonld') as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'entropy-schema-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(
        schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas }
      );
    } else {
      // Remove schema script if on admin page
      const adminScript = document.getElementById('entropy-schema-jsonld');
      if (adminScript) {
        adminScript.remove();
      }
    }
  }, [pathname]);

  return null;
};

export default RouteMetadata;
