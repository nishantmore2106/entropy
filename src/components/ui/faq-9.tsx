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
      'ENTROPY is an independent creative technology studio working across branding, UI/UX design, website design, and website development. We bring strategy, design, and technology together to create purposeful digital experiences.',
  },
  {
    id: 'faq-2',
    question: 'What services can I work with you on?',
    answer:
      'We work on brand strategy, brand identity, logo design, UI/UX design, website design, landing pages, e-commerce websites, and custom website development. The right scope depends on your project goals.',
  },
  {
    id: 'faq-3',
    question: 'How much does a project cost?',
    answer: (
      <span>
        Pricing depends on the type of project, its scope, and the functionality required. Our website packages include landing pages, e-commerce websites, and custom websites. Branding and design projects are scoped separately. Visit our{' '}
        <a
          href="#pricing"
          className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
        >
          pricing section
        </a>{' '}
        or contact us for a proposal tailored to your needs.
      </span>
    ),
  },
  {
    id: 'faq-4',
    question: 'Do you design and develop websites?',
    answer:
      'Yes. We provide website design and development, from defining the visual direction and designing the interface to building responsive pages and implementing the required functionality.',
  },
  {
    id: 'faq-5',
    question: 'Can you redesign an existing website?',
    answer:
      "Yes. We can help refine an existing website's visual identity, structure, usability, and responsive experience. The scope depends on the current website and the improvements you need.",
  },
  {
    id: 'faq-6',
    question: 'Can I hire you for branding or logo design only?',
    answer:
      'Yes. You can work with ENTROPY on a focused branding project, including logo design or a broader brand identity. We will define the deliverables around your requirements.',
  },
  {
    id: 'faq-7',
    question: 'How long does a project take?',
    answer:
      'Timelines depend on the project’s size, complexity, feedback, and required functionality. We establish a realistic schedule after understanding the scope and deliverables.',
  },
  {
    id: 'faq-8',
    question: 'What do you need to start a project?',
    answer:
      'Start with a short description of your business, project goals, preferred services, budget range, and any useful references. We can then discuss the scope and next steps.',
  },
  {
    id: 'faq-9',
    question: 'Will my website work on mobile devices?',
    answer:
      'Responsive design is part of our website design and development process. We design and implement layouts with different screen sizes in mind and check the experience across relevant viewport sizes.',
  },
  {
    id: 'faq-10',
    question: 'How do I get started with ENTROPY?',
    answer:
      'Tell us what you are looking to create or improve. Share your goals, requirements, and any relevant references through our contact channel. We can then discuss the project and its next steps.',
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
