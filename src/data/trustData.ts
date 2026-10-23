export interface CollaborationPillar {
  title: string;
  detail: string;
  benchmark: string;
}

export interface ClientOutcomePreview {
  industry: string;
  engagementType: string;
  focusArea: string;
  deliverableOutcome: string;
  operationalNote: string;
}

export const collaborationPillars: CollaborationPillar[] = [
  {
    title: 'Senior Practitioner Direct Access',
    detail: 'Work directly with the principals who design and write the code. No middle managers or junior handoffs.',
    benchmark: 'Direct Founder & Lead Engineer Slack/Async Channel',
  },
  {
    title: '100% IP & Code Ownership',
    detail: 'Every line of code, design token, Figma library, and digital asset is entirely owned by your team upon delivery.',
    benchmark: 'Clean GitHub Repositories & Unrestricted Design Libraries',
  },
  {
    title: 'Transparent Weekly Sprints',
    detail: 'Live staging environments updated every Friday. Complete visibility into progress, obstacles, and budget burn.',
    benchmark: 'Weekly Loom Updates & Continuous Staging Deployments',
  },
  {
    title: 'Built For Handover',
    detail: 'We document component conventions, architecture decisions, and maintenance procedures so your internal team thrives.',
    benchmark: 'Interactive Storybooks & Modular Documentation',
  },
];

export const clientOutcomesData: ClientOutcomePreview[] = [
  {
    industry: 'DeepTech / Robotics',
    engagementType: 'End-to-End Brand & Web Experience',
    focusArea: 'Generative Typography & High-Precision Hardware Portals',
    deliverableOutcome: 'Unified international identity and sub-second marketing flagship deployment.',
    operationalNote: 'Demonstration engagement structure',
  },
  {
    industry: 'Acoustic Engineering',
    engagementType: 'Digital Flagship & Spatial Visualizer',
    focusArea: 'WebGL Shader Sound Modeling & Headless E-commerce',
    deliverableOutcome: 'Multi-device 60fps audio-reactive web showcase with zero bundle bloat.',
    operationalNote: 'Demonstration engagement structure',
  },
  {
    industry: 'FinTech / Volatility Analytics',
    engagementType: 'Mission-Critical Workstation Design System',
    focusArea: 'High-Density Ergonomic Interface & Keyboard Command UX',
    deliverableOutcome: 'Tokenized component architecture tested for multi-hour cognitive endurance.',
    operationalNote: 'Demonstration engagement structure',
  },
];
