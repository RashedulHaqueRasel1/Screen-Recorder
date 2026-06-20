
import type { LucideIcon } from "lucide-react";

export interface HeroStat {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export interface HeroTrustItem {
  label: string;
  icon: LucideIcon;
}

export interface HeroCta {
  label: string;
  href: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
}
