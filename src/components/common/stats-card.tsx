"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export function StatsCard({
  label,
  value,
  description,
  icon: Icon,
  color = "from-indigo-500 to-purple-500",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 hover:border-border/80 transition-colors overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
          color
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
