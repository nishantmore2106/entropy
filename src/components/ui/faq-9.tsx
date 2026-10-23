import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Plus, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GetStartedButton } from './GetStartedButton';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

export interface FAQ9ContactPanelProps {
  title?: string;
  description?: string;
  primaryCtaText?: string;
  onPrimaryCta?: () => void;
  secondaryLinkText?: string;
  secondaryLinkHref?: string;
  note?: string;
}

export interface FAQ9Props {
  heading?: string;
  subheading?: string;
  tag?: string;
  faqs?: FAQItem[];
  contactPanel?: FAQ9ContactPanelProps;
  className?: string;
  defaultOpenIndex?: number | null;
}

export const defaultEntropyFaqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What does ENTROPY do?',
    answer:
      'ENTROPY is an independent creative technology studio based in Vadodara, Gujarat. We bring brand strategy, identity design, UI/UX architecture, and modern website engineering together to craft high-performance digital flagships for ambitious companies worldwide.',
  },
  {
    id: 'faq-2',
    question: 'What services does ENTROPY provide?',
    answer:
      'Our primary disciplines span brand identity systems, brand strategy, custom logo design, UI/UX systems, bespoke website design, custom frontend development, e-commerce storefronts, campaign landing pages, and motion interaction design.',
  },
  {
    id: 'faq-3',
    question: 'Does ENTROPY design and develop complete websites?',
    answer:
      'Yes. We handle end-to-end website projects from strategic discovery and information architecture to bespoke interface design, responsive frontend engineering, technical SEO, and production deployment.',
  },
  {
    id: 'faq-4',
    question: 'Can ENTROPY redesign an existing website?',
    answer:
      'Yes. We transform underperforming or outdated websites into modern digital flagships. Our redesign process re-evaluates visual art direction, user journeys, content structure, mobile ergonomics, and core performance to dramatically improve engagement and conversion.',
  },
  {
    id: 'faq-5',
    question: 'Does ENTROPY build e-commerce websites?',
    answer:
      'Yes. We design and build bespoke e-commerce experiences that unite high-resolution product storytelling, dynamic collection filtering, frictionless cart interactions, and secure checkout flows.',
  },
  {
    id: 'faq-6',
    question: 'Can ENTROPY create custom landing pages and microsites?',
    answer:
      'Yes. We build focused, high-conversion campaign landing pages and product launch microsites structured around sharp value propositions, narrative hierarchy, and decisive user actions.',
  },
  {
    id: 'faq-7',
    question: 'Does ENTROPY work with CMS and dynamic websites?',
    answer:
      'Yes. We architect dynamic web applications and scalable content management workflows that allow your team to publish articles, update portfolios, and manage content seamlessly with full security and revision control.',
  },
  {
    id: 'faq-8',
    question: 'How does ENTROPY approach UI/UX design?',
    answer:
      'We design around user mental models and empirical friction points. We build comprehensive atomic design systems in Figma—complete with typography hierarchies, responsive auto-layouts, accessibility contrasts, and micro-interactions—before developer handoff.',
  },
  {
    id: 'faq-9',
    question: 'Does ENTROPY provide performance optimization and maintenance?',
    answer:
      'Yes. We build websites with sub-second target load times, semantic HTML, modern asset compression, and clean Core Web Vitals. We also provide ongoing maintenance, uptime monitoring, and security patching to keep platforms running smoothly.',
  },
  {
    id: 'faq-10',
    question: 'Does ENTROPY create motion graphics and interaction design?',
    answer:
      'Yes. We craft purposeful micro-interactions, scroll-linked spatial camera transforms, 60fps kinetic reveals, and WebGL animation details that make digital experiences feel alive while honoring prefers-reduced-motion preferences.',
  },
  {
    id: 'faq-11',
    question: 'What affects the price and timeline of a website project?',
    answer:
      'Project scope, custom functionality, number of unique page templates, 3D or animation requirements, and third-party integrations determine cost and timing. Standard landing pages typically take 1–3 weeks, while comprehensive brand and website builds take 4–8 weeks with tailored proposals.',
  },
  {
    id: 'faq-12',
    question: 'How can a prospective client start a project?',
    answer:
      'Start by submitting a project enquiry through our contact form or emailing entropy.helpdesk@gmail.com with your project overview, goals, desired timeline, and budget range. We review your requirements and respond within one business day.',
  },
];

/**
 * React Bits Pro FAQ 9 · FAQ grid with sticky contact panel
 * Native 2-column question grid paired with a sticky contact card on desktop,
 * transitioning to responsive vertical stacking on mobile devices.
 */
export const FAQ9: React.FC<FAQ9Props> = ({
  heading = 'Frequently asked questions',
  subheading,
  tag = 'Common inquiries',
  faqs = defaultEntropyFaqs,
  contactPanel = {
    title: 'Have a project in mind?',
    description: "Tell us what you're building. Let's find the right direction.",
    primaryCtaText: 'Start a project',
    secondaryLinkText: 'Explore our work',
    secondaryLinkHref: '#selected-work',
  },
  className = '',
  defaultOpenIndex = null,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  // Divide FAQs into two balanced columns for the grid layout
  const half = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, half);
  const rightColumn = faqs.slice(half);
  const columns = [leftColumn, rightColumn];

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: CUBIC_EASE },
    },
  };

  return (
    <section
      id="faqs"
      aria-label="Frequently Asked Questions"
      className={cn(
        'relative w-full bg-[#000000] text-[#F5F5F7] overflow-hidden',
        className
      )}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {tag && (
            <p className="text-xs sm:text-sm font-medium tracking-[0.16em] text-[#8E8E93] mb-3 select-none">
              {tag}
            </p>
          )}
          <h2 className={cn("font-['Rigter',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] text-white tracking-tight leading-none select-none", subheading ? 'mb-4' : 'mb-0')}>
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm sm:text-base text-[#A1A1A6] font-normal leading-relaxed max-w-xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        {/* FAQ 9 Grid Layout with Sticky Contact Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Native Sticky Contact Panel */}
          <motion.aside
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between gap-8 sm:gap-10 rounded-3xl bg-[#08080A] p-6 sm:p-8 lg:p-9 border border-white/[0.12] hover:border-white/20 transition-colors duration-300 lg:sticky lg:top-28 lg:self-start"
          >
            <div>
              <h3 className="font-['Rigter',sans-serif] text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-[1.15] mb-3 sm:mb-4">
                {contactPanel.title || 'Have a project in mind?'}
              </h3>
              <p className="text-sm sm:text-[15px] text-[#A1A1A6] font-normal leading-relaxed max-w-md">
                {contactPanel.description ||
                  "Tell us what you're building. Let's find the right direction."}
              </p>
            </div>

            {/* Action Group */}
            <div className="pt-2 flex flex-col gap-5 border-t border-white/[0.08]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <GetStartedButton
                  onClick={contactPanel.onPrimaryCta}
                  defaultText={contactPanel.primaryCtaText || 'Start a project'}
                  hoverText="Let's build"
                  icon={<ArrowUpRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                />

                {contactPanel.secondaryLinkText && contactPanel.secondaryLinkHref && (
                  <a
                    href={contactPanel.secondaryLinkHref}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-xs sm:text-sm font-medium text-[#A1A1A6] hover:text-white border border-transparent hover:border-white/10 transition-colors"
                  >
                    <span>{contactPanel.secondaryLinkText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </a>
                )}
              </div>

              {contactPanel.note && (
                <p className="text-xs text-[#71717A] font-mono leading-relaxed">
                  {contactPanel.note}
                </p>
              )}
            </div>
          </motion.aside>

          {/* Native 2-Column FAQ Accordion Grid */}
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.04,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start"
          >
            {columns.map((columnFaqs, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {columnFaqs.map((item, itemInColIndex) => {
                  const globalIndex = colIndex * half + itemInColIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className={cn(
                        'rounded-2xl border transition-all duration-300 overflow-hidden',
                        isOpen
                          ? 'border-white/25 bg-[#0D0D11] shadow-[0_12px_32px_-10px_rgba(0,0,0,0.85)]'
                          : 'border-white/[0.09] bg-[#070709] hover:border-white/20 hover:bg-[#0A0A0E]'
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq9-answer-${globalIndex}`}
                        onClick={() => handleToggle(globalIndex)}
                        className="group flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span className="flex-1 text-sm sm:text-base font-medium leading-snug text-white group-hover:text-white transition-colors">
                          {item.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className={cn(
                            'mt-0.5 shrink-0 transition-colors duration-200',
                            isOpen
                              ? 'text-white'
                              : 'text-neutral-500 group-hover:text-white'
                          )}
                        >
                          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq9-answer-${globalIndex}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: {
                                duration: shouldReduceMotion ? 0 : 0.38,
                                ease: [0.22, 1, 0.36, 1],
                              },
                              opacity: {
                                duration: shouldReduceMotion ? 0 : 0.28,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-[13.5px] leading-relaxed text-[#A1A1A6]">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ9;
