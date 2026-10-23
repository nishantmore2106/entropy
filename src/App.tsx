/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { HeroPlaceholder } from './sections/HeroPlaceholder';
import { AboutEntropySection } from './sections/AboutEntropySection';
import { SelectedWorkSection } from './sections/SelectedWorkSection';
import { ServicesDirectorySection } from './sections/ServicesDirectorySection';
import { RibbonTypeSection } from './sections/RibbonTypeSection';
import { OurApproachSection } from './sections/OurApproachSection';
import { FAQSection } from './sections/FAQSection';
import { PricingSection } from './sections/PricingSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { SiteFooter } from './components/layout/SiteFooter';

import { MagneticDockNav } from './components/navigation/MagneticDockNav';
import { CaseStudyModal } from './components/modals/CaseStudyModal';
import { ProjectInquiryModal } from './components/modals/ProjectInquiryModal';
import { ProjectItem } from './data/projectsData';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getServiceBySlug } from './data/servicesData';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { WorksPage } from './pages/WorksPage';
import { ServicesPage } from './pages/ServicesPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ContactPage } from './pages/ContactPage';
import { PageTransition } from './components/transition/PageTransition';
import { RouteMetadata } from './components/common/RouteMetadata';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminEnquiryDetailPage } from './pages/admin/AdminEnquiryDetailPage';
import { AdminEmailPage } from './pages/admin/AdminEmailPage';

function AppContent() {
  const { pathname, navigate } = useRouter();
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  const handleOpenInquiry = (serviceName?: string) => {
    setPreselectedService(serviceName);
    if (serviceName) {
      navigate(`/contact?service=${encodeURIComponent(serviceName)}`);
    } else {
      navigate('/contact');
    }
  };

  const handleCloseInquiry = () => {
    setIsInquiryOpen(false);
    setPreselectedService(undefined);
  };

  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const isAdminRoute = cleanPath.startsWith('/admin');

  // Handle Protected /admin routes with separate dedicated layout
  if (isAdminRoute) {
    if (cleanPath === '/admin/login') {
      return (
        <div className="min-h-screen bg-[#07080B] text-white font-sans">
          <RouteMetadata />
          <AdminLoginPage />
        </div>
      );
    }

    if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') {
      return (
        <div className="min-h-screen bg-[#07080B] text-white font-sans">
          <RouteMetadata />
          <AdminDashboardPage />
        </div>
      );
    }

    if (cleanPath === '/admin/enquiries') {
      return (
        <div className="min-h-screen bg-[#07080B] text-white font-sans">
          <RouteMetadata />
          <AdminEnquiriesPage />
        </div>
      );
    }

    if (cleanPath === '/admin/email') {
      return (
        <div className="min-h-screen bg-[#07080B] text-white font-sans">
          <RouteMetadata />
          <AdminEmailPage />
        </div>
      );
    }

    const enquiryDetailMatch = cleanPath.match(/^\/admin\/enquiries\/([a-zA-Z0-9_-]+)$/);
    if (enquiryDetailMatch) {
      return (
        <div className="min-h-screen bg-[#07080B] text-white font-sans">
          <RouteMetadata />
          <AdminEnquiryDetailPage id={enquiryDetailMatch[1]} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#07080B] text-white font-sans">
        <RouteMetadata />
        <AdminDashboardPage />
      </div>
    );
  }

  // Helper to resolve public routes
  const renderRoute = () => {
    // 1. Homepage
    if (cleanPath === '/' || cleanPath === '') {
      return (
        <main>
          {/* SECTION 0 — ENTROPY Voxel Arc Hero */}
          <HeroPlaceholder onOpenInquiry={(service) => handleOpenInquiry(service)} />

          {/* Main Studio Content Sections */}
          <div className="relative z-10 bg-[#000000]">
            {/* SECTION 2 — About ENTROPY (editorial studio story) */}
            <AboutEntropySection />

            {/* SECTION 3 — Selected Work (Spiral 3D Slider & FluxLines) */}
            <SelectedWorkSection
              onSelectProject={(project) => setActiveProject(project)}
              onOpenInquiry={() => handleOpenInquiry()}
            />

            {/* FULL-WIDTH ANIMATED RIBBON TYPE — Edge-to-edge 3D service typography */}
            <RibbonTypeSection />

            {/* SERVICES DIRECTORY — What We Do (8-Service Grid + Galaxy Feature Card) */}
            <ServicesDirectorySection onOpenInquiry={(service) => handleOpenInquiry(service)} />

            {/* PRICING SECTION — Dedicated 3-Card Filterable Pricing Experience with Obsidian Texture & White Border Beam */}
            <PricingSection onOpenInquiry={(service) => handleOpenInquiry(service)} />

            {/* OUR APPROACH — Four-Card Editorial Grid Communicating Studio Philosophy */}
            <OurApproachSection />

            {/* FAQ SECTION — React Bits Pro FAQ 9 with Native Grid & Sticky Contact Panel */}
            <FAQSection onOpenInquiry={(service) => handleOpenInquiry(service)} />

            {/* SECTION 7 — Final Project Call to Action */}
            <FinalCtaSection onOpenInquiry={() => handleOpenInquiry()} />
          </div>
        </main>
      );
    }

    // 2. Editorial About Us Page: /about-us and /about
    if (cleanPath === '/about-us' || cleanPath === '/about') {
      return (
        <main>
          <AboutUsPage onOpenInquiry={() => handleOpenInquiry()} />
        </main>
      );
    }

    // 3. Works Page: /works and /work
    if (cleanPath === '/works' || cleanPath === '/work') {
      return (
        <main>
          <WorksPage
            onSelectProject={(project) => setActiveProject(project)}
            onOpenInquiry={() => handleOpenInquiry()}
          />
        </main>
      );
    }

    // 4. Services Page: /services and /service
    if (cleanPath === '/services' || cleanPath === '/service') {
      return (
        <main>
          <ServicesPage onOpenInquiry={(service) => handleOpenInquiry(service)} />
        </main>
      );
    }

    // 5. Individual Service Detail Pages: /services/:slug or /service/:slug
    const serviceSlugMatch = cleanPath.match(/^\/(?:services|service)\/([a-zA-Z0-9_-]+)$/);
    if (serviceSlugMatch) {
      const slug = serviceSlugMatch[1];
      const service = getServiceBySlug(slug);
      if (service) {
        return (
          <main>
            <ServiceDetailPage
              service={service}
              onOpenInquiry={(serviceName) => handleOpenInquiry(serviceName)}
            />
          </main>
        );
      }
      return (
        <main className="pt-20">
          <NotFoundPage />
        </main>
      );
    }

    // 6. Contact & Get Started Page: /contact, /get-started, /inquiry
    if (
      cleanPath === '/contact' ||
      cleanPath === '/get-started' ||
      cleanPath === '/inquiry'
    ) {
      return (
        <main>
          <ContactPage initialService={preselectedService} />
        </main>
      );
    }

    // 7. Default 404
    return (
      <main className="pt-20">
        <NotFoundPage />
      </main>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#F4F4F2] selection:bg-[#E85A32] selection:text-white flex flex-col justify-between">
      {/* Centralized dynamic document metadata & page title listener */}
      <RouteMetadata />

      {/* 
        Primary Magnetic Dock Navigation: Exactly 4 items (Home, About Us, Works, Services)
      */}
      <MagneticDockNav onOpenInquiry={() => handleOpenInquiry()} />

      {/* Render active route with shared cinematic page transition */}
      <PageTransition>
        {renderRoute()}
      </PageTransition>

      {/* Shared Global Cinematic Studio Footer across ALL routes */}
      <SiteFooter onOpenInquiry={() => handleOpenInquiry()} />

      {/* Case Study Deep-Dive Slide-Over Drawer */}
      <CaseStudyModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onOpenInquiry={(service) => handleOpenInquiry(service)}
      />

      {/* Interactive Project Inquiry Drawer */}
      <ProjectInquiryModal
        isOpen={isInquiryOpen}
        onClose={handleCloseInquiry}
        initialService={preselectedService}
      />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
