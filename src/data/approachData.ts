export interface ApproachPillar {
  number: string;
  title: string;
  lead: string;
  description: string;
  contrastConcept: string;
}

export const approachData: ApproachPillar[] = [
  {
    number: '01',
    title: 'Strategy Before Execution',
    lead: 'We define the problem and direction before deciding how the final experience should look or function.',
    description: 'A beautiful interface that solves the wrong problem is visual waste. We interrogate your business model, target audience, technical constraints, and market differentiator first, constructing an unshakeable strategic thesis that directs every subsequent creative decision.',
    contrastConcept: 'No decorative guesswork. Every pixel traces back to a strategic objective.',
  },
  {
    number: '02',
    title: 'Brand and Technology Together',
    lead: 'We connect visual identity, interface design, and implementation instead of treating them as isolated activities.',
    description: 'When branding teams and engineering teams work in silos, the vision breaks down in translation. At ENTROPY, design systems and code architectures are conceived concurrently, ensuring interactive precision, typographic fidelity, and seamless responsiveness from day one.',
    contrastConcept: 'Unified creative engineering. Zero handoff friction or aesthetic dilution.',
  },
  {
    number: '03',
    title: 'Custom by Nature',
    lead: 'We create bespoke digital experiences rather than relying on generic website templates.',
    description: 'Pre-packaged CMS themes and boilerplate components flatten modern web experiences into interchangeable sameness. Every identity, layout rhythm, interaction, and component we engineer is built from foundational principles to amplify what makes your venture distinct.',
    contrastConcept: 'Handcrafted architecture. Zero reliance on bloated cookie-cutter themes.',
  },
  {
    number: '04',
    title: 'Made to Evolve',
    lead: 'We consider consistency, usability, maintainability, and future growth from the beginning.',
    description: 'Digital experiences should never be disposable. We engineer strict design token taxonomies, modular component systems, and clean TypeScript codebases designed for effortless scaling, internal team adoption, and continuous feature expansion.',
    contrastConcept: 'Built for longevity. High documentation fidelity and maintainable codebases.',
  },
];
