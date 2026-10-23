import React from "react";
import {
  ScrollSplitCard,
  ScrollSplitCardItem,
} from "../components/ui/scroll-split-card";
import {
  Palette,
  Sparkles,
  Layers,
  PenTool,
  Type,
  Layout,
  Smartphone,
  Component,
  MousePointerClick,
  Compass,
  Code2,
  Zap,
  Workflow,
  Globe,
  Rocket,
} from "lucide-react";
import { ScrollReveal } from "../components/common/ScrollReveal";

/**
 * ENTROPY — Section 03: Scroll Split Feature Cards
 * Minimal big-text feature cards: White (Branding) → Blue (UI/UX) → Black (Web Dev)
 * Split image inspired by reference digital creator illustration.
 */
export const splitFeatureCards: ScrollSplitCardItem[] = [
  {
    identifier: "01 / Branding",
    title: "Identity That Means Something",
    bgColor: "#09090C",
    textColor: "#FFFFFF",
    borderColor: "border border-white/15 shadow-2xl",
    headerIcon: <Palette className="w-7 h-7 sm:w-9 sm:h-9 text-white" />,
    features: [
      {
        label: "Logo & Visual Systems",
        icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Brand Identity Kits",
        icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Design Guidelines",
        icon: <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Typography & Palettes",
        icon: <Type className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
    ],
  },
  {
    identifier: "02 / UI/UX Design",
    title: "Experiences Designed Around People",
    bgColor: "#09090C",
    textColor: "#FFFFFF",
    borderColor: "border border-white/15 shadow-2xl",
    headerIcon: <Layout className="w-7 h-7 sm:w-9 sm:h-9 text-white" />,
    features: [
      {
        label: "Web & Mobile Interfaces",
        icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Design Systems",
        icon: <Component className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Interactive Prototypes",
        icon: (
          <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
        ),
      },
      {
        label: "User Journeys & IA",
        icon: <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
    ],
  },
  {
    identifier: "03 / Web Development",
    title: "From Concept to Digital Reality",
    bgColor: "#09090C",
    textColor: "#FFFFFF",
    borderColor: "border border-white/15 shadow-2xl",
    headerIcon: <Code2 className="w-7 h-7 sm:w-9 sm:h-9 text-white" />,
    features: [
      {
        label: "High-Performance Web",
        icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Scroll & 3D Visuals",
        icon: <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Landing Pages & Platforms",
        icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
      {
        label: "Production Scale & SEO",
        icon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />,
      },
    ],
  },
];

interface ScrollSplitFeatureSectionProps {
  className?: string;
  onOpenInquiry?: (serviceName?: string) => void;
}

export const ScrollSplitFeatureSection: React.FC<
  ScrollSplitFeatureSectionProps
> = ({ className = "" }) => {
  return (
    <section
      id="capabilities"
      aria-label="ENTROPY Capabilities"
      className={`relative w-full bg-[#000000] select-none ${className}`}
    >
      <span id="capabilities" className="sr-only" />
      <ScrollReveal yOffset={20}>
        <ScrollSplitCard
          imageSrc="/assets/pricing/obsidian-texture.jpg"
          cards={splitFeatureCards}
          className="w-full"
        />
      </ScrollReveal>
    </section>
  );
};

export default ScrollSplitFeatureSection;
