"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started with screen recording.",
    features: [
      "Unlimited recordings",
      "720p HD quality",
      "Google Drive upload",
      "Basic video editing",
      "Shareable links",
      "Recording history",
    ],
    cta: "Start Free",
    href: "/signin",
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 12, yearly: 9 },
    description: "For professionals who need the best quality and tools.",
    features: [
      "Everything in Free",
      "1080p Full HD quality",
      "Advanced video editing",
      "Priority processing",
      "Team sharing",
      "Custom thumbnails",
      "No watermark",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "/signin",
    highlighted: true,
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Simple pricing
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Start free, upgrade when you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. No credit card required to start.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/40 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                billing === "monthly" ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billing === "yearly" ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              Yearly
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl border p-8 backdrop-blur-xl transition-all",
                plan.highlighted
                  ? "border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-transparent shadow-xl shadow-purple-500/10"
                  : "border-border/40 bg-card/40 hover:border-border/80"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${billing === "yearly" ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              {billing === "yearly" && plan.price.yearly > 0 && (
                <p className="mt-1 text-xs text-emerald-500">Billed annually (${plan.price.yearly * 12}/year)</p>
              )}

              <Button
                asChild
                className={cn(
                  "mt-6 w-full h-12 rounded-2xl font-semibold",
                  plan.highlighted
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : ""
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
