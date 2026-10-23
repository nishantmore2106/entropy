import { siteConfig, SITE_URL } from '../data/siteConfig';
import { ServiceItem } from '../data/servicesData';
import { FAQItem } from '../components/ui/faq-9';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds canonical schema for the ENTROPY organization and professional studio entity.
 */
export function buildOrganizationSchema(): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: siteConfig.studioName,
    legalName: siteConfig.legalName,
    alternateName: ['ENTROPY Studio', 'Entropy Creative Technology'],
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/Artboard%205%402x.png`,
      caption: 'ENTROPY Studio Emblem',
    },
    image: `${SITE_URL}/Artboard%205%402x.png`,
    description: siteConfig.descriptor,
    slogan: siteConfig.tagline,
    telephone: siteConfig.phone,
    email: siteConfig.contactEmail,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    priceRange: siteConfig.priceRange,
    currenciesAccepted: 'INR, USD, EUR, GBP',
    paymentAccepted: 'Bank Transfer, Credit Card, Wire',
    areaServed: [
      {
        '@type': 'Country',
        name: 'India',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Worldwide',
      },
    ],
    sameAs: siteConfig.socials.map((s) => s.href).filter(Boolean),
    knowsAbout: [
      'Brand Identity Systems',
      'UI/UX Architecture',
      'Custom Website Development',
      'E-commerce Flagships',
      'Campaign Landing Pages',
      'Motion & Interaction Design',
      'Performance Optimization',
      'Digital Product Strategy',
    ],
  };

  // Only include exact GeoCoordinates and walk-in storefront hours if owner has verified a public physical office
  if (siteConfig.hasPublicPhysicalOffice && siteConfig.publishExactCoordinates && siteConfig.geo) {
    schema['@type'] = ['Organization', 'ProfessionalService'];
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    };
  }

  return schema;
}

/**
 * Builds schema for the ENTROPY website entity.
 */
export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: siteConfig.studioName,
    description: siteConfig.descriptor,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  };
}

/**
 * Builds schema for individual web pages with entity relationships.
 */
export function buildWebPageSchema(
  canonicalPath: string,
  title: string,
  description: string,
  pageType: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage' = 'WebPage'
): Record<string, unknown> {
  const pageUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${pageUrl}#${pageType.toLowerCase()}`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  };
}

/**
 * Builds schema for structured breadcrumb trails.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Builds schema for specific service offering pages.
 */
export function buildServiceSchema(service: ServiceItem): Record<string, unknown> {
  const serviceUrl = `${SITE_URL}/services/${service.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${serviceUrl}#service`,
    url: serviceUrl,
    name: service.name,
    serviceType: service.mainHeading,
    description: service.shortDescription || service.introduction,
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'India',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Worldwide',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} Deliverables`,
      itemListElement: service.inclusions.map((inclusion) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: inclusion,
        },
      })),
    },
  };
}

/**
 * Strips HTML / React nodes to plain text for schema compliance.
 */
function toPlainText(node: string | React.ReactNode): string {
  if (typeof node === 'string') return node;
  return 'Pricing depends on project scope, required functionality, and deliverables. Branding and custom website projects are scoped with tailored proposals.';
}

/**
 * Builds FAQPage schema for visible FAQ questions and answers.
 */
export function buildFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: toPlainText(faq.answer),
      },
    })),
  };
}
