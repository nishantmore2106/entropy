import React from 'react';

export interface ProcessStage {
  step: string;
  title: string;
  description: string;
  output: string;
  image: string;
  color: string;
  glow: string;
  border: string;
  tagline: string;
  icon: React.ReactNode;
}

export const processCards: ProcessStage[] = [
  {
    step: '01',
    title: 'Discover',
    tagline: '01 / DISCOVERY',
    description: "Understand goals, audience, and core business challenges.",
    output: 'Discovery brief',
    image: '/assets/process/01-discover.jpg',
    color: '#3B82F6', // Cobalt Blue
    glow: 'rgba(59, 130, 246, 0.4)',
    border: 'rgba(96, 165, 250, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
        <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
        <circle cx="24" cy="24" r="3.5" fill="#3B82F6" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Define',
    tagline: '02 / STRATEGY',
    description: 'Establish project scope, priorities, and strategic direction.',
    output: 'Creative brief',
    image: '/assets/process/02-define.jpg',
    color: '#06B6D4', // Luminous Cyan
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'rgba(34, 211, 238, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M6 10H14M10 6V14M34 10H42M38 6V14M6 38H14M10 34V42M34 38H42M38 34V42" stroke="#06B6D4" strokeWidth="1.5" />
        <line x1="24" y1="18" x2="24" y2="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
        <line x1="18" y1="24" x2="30" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Concept',
    tagline: '03 / IDEATION',
    description: 'Explore creative ideas, moodboards, and visual directions.',
    output: 'Concepts & moodboards',
    image: '/assets/process/03-concept.jpg',
    color: '#8B5CF6', // Vivid Purple
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'rgba(167, 139, 250, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M24 7L39 16V32L24 41L9 32V16L24 7Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
        <path d="M24 7V41M24 24L39 16M24 24L9 16M24 24L39 32M24 24L9 32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
        <circle cx="24" cy="24" r="3" fill="#8B5CF6" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Design',
    tagline: '04 / DESIGN SYSTEM',
    description: 'Develop the visual identity and interface system.',
    output: 'Design concepts',
    image: '/assets/process/04-design.jpg',
    color: '#0EA5E9', // Sky Blue
    glow: 'rgba(14, 165, 233, 0.4)',
    border: 'rgba(56, 189, 248, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M10 36C14 16 34 16 38 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />
        <rect x="7" y="33" width="6" height="6" fill="#0EA5E9" />
        <rect x="35" y="33" width="6" height="6" fill="#0EA5E9" />
        <circle cx="14" cy="20" r="2.5" fill="white" stroke="#0EA5E9" strokeWidth="1.5" />
        <circle cx="34" cy="20" r="2.5" fill="white" stroke="#0EA5E9" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Prototype',
    tagline: '05 / INTERACTION',
    description: 'Map user journeys and test interactions in motion.',
    output: 'Interactive prototype',
    image: '/assets/process/05-prototype.jpg',
    color: '#D946EF', // Electric Magenta
    glow: 'rgba(217, 70, 239, 0.4)',
    border: 'rgba(232, 121, 249, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle cx="12" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" fill="#0B0B0E" />
        <circle cx="36" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" fill="#0B0B0E" />
        <circle cx="36" cy="34" r="5" stroke="currentColor" strokeWidth="1.5" fill="#0B0B0E" />
        <path d="M17 22L31 16M17 26L31 32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="12" cy="24" r="2" fill="#D946EF" />
        <circle cx="36" cy="14" r="2" fill="white" />
        <circle cx="36" cy="34" r="2" fill="white" />
      </svg>
    ),
  },
  {
    step: '06',
    title: 'Develop',
    tagline: '06 / ENGINEERING',
    description: 'Build the approved experience with modern technology.',
    output: 'Working build',
    image: '/assets/process/06-develop.jpg',
    color: '#10B981', // Emerald Mint
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(52, 211, 153, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M16 16L8 24L16 32M32 16L40 24L32 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="26" y1="13" x2="22" y2="35" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="19" y2="24" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
      </svg>
    ),
  },
  {
    step: '07',
    title: 'Refine',
    tagline: '07 / POLISH & QA',
    description: 'Test, optimise, and polish performance and interactions.',
    output: 'Refined deliverable',
    image: '/assets/process/07-refine.jpg',
    color: '#F59E0B', // Solar Amber
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(251, 191, 36, 0.3)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M24 8L38 24L24 40L10 24L24 8Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
        <circle cx="24" cy="24" r="5" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="24" y1="4" x2="24" y2="10" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="24" y1="38" x2="24" y2="44" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="4" y1="24" x2="10" y2="24" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="38" y1="24" x2="44" y2="24" stroke="#F59E0B" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    step: '08',
    title: 'Deliver',
    tagline: '08 / LAUNCH',
    description: 'Prepare final files, handover, and launch support.',
    output: 'Final deliverables',
    image: '/assets/process/08-deliver.jpg',
    color: '#60A5FA', // Ice Platinum Blue
    glow: 'rgba(96, 165, 250, 0.4)',
    border: 'rgba(191, 215, 242, 0.35)',
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 text-white"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="M24 7L37 38L24 30L11 38L24 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 7V30" stroke="#60A5FA" strokeWidth="1.5" />
        <path d="M9 43C18 39 30 39 39 43" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="3 3" />
      </svg>
    ),
  },
];

export const processData = processCards;
