
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { HeroCta, HeroStat, HeroTrustItem } from "../types/hero";

export const HERO_HEADLINE =
  "Build enterprise-grade products with speed, clarity, and confidence.";

export const HERO_SUPPORTING_TEXT =
  "Launch a premium digital experience with a scalable foundation designed for modern teams, polished user journeys, and long-term growth.";

export const HERO_PRIMARY_CTA: HeroCta = {
  label: "Start free trial",
  href: "#get-started",
  variant: "default",
};

export const HERO_SECONDARY_CTA: HeroCta = {
  label: "Book a demo",
  href: "#demo",
  variant: "outline",
};

export const HERO_TRUST_ITEMS: HeroTrustItem[] = [
  { label: "SOC 2 Ready", icon: ShieldCheck },
  { label: "99.99% Uptime", icon: Zap },
  { label: "Trusted by modern teams", icon: CheckCircle2 },
];

export const HERO_STATS: HeroStat[] = [
  {
    label: "Teams onboarded",
    value: "2,400+",
    description: "Across startups and enterprise organizations",
    icon: BarChart3,
  },
  {
    label: "Time saved",
    value: "38%",
    description: "Faster execution with streamlined workflows",
    icon: ArrowUpRight,
  },
  {
    label: "Automation coverage",
    value: "94%",
    description: "Operational tasks handled automatically",
    icon: Sparkles,
  },
];
