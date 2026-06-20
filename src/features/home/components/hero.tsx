
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  HERO_HEADLINE,
  HERO_PRIMARY_CTA,
  HERO_SECONDARY_CTA,
  HERO_STATS,
  HERO_SUPPORTING_TEXT,
  HERO_TRUST_ITEMS,
} from "../constants/hero";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-6rem] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="max-w-2xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {HERO_TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <h1
              id="hero-heading"
              className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {HERO_HEADLINE}
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              {HERO_SUPPORTING_TEXT}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href={HERO_PRIMARY_CTA.href}>
                  {HERO_PRIMARY_CTA.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <Link href={HERO_SECONDARY_CTA.href}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {HERO_SECONDARY_CTA.label}
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {HERO_TRUST_ITEMS.map((item) => (
                <div key={item.label} className="inline-flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-emerald-500" />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {HERO_STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl font-semibold tracking-tight text-foreground">
                        {stat.value}
                      </p>
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/20 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
              <div className="border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Active projects
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      128
                    </p>
                    <p className="mt-2 text-sm text-emerald-500">
                      +18% from last month
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Team efficiency
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      94%
                    </p>
                    <p className="mt-2 text-sm text-emerald-500">
                      Consistent weekly growth
                    </p>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl border border-border/60 bg-background/80 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        Workflow automation
                      </p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Live
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {[
                        "Lead captured",
                        "Workflow assigned",
                        "Approval completed",
                        "Deployment shipped",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-3 py-2"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
