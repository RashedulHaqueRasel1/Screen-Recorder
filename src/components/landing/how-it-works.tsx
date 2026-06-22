"use client";

import { motion } from "framer-motion";
import { MonitorPlay, Scissors, HardDriveUpload, Share2 } from "lucide-react";

const steps = [
  {
    icon: MonitorPlay,
    step: "01",
    title: "Record",
    description: "Choose your source — screen, webcam, or both. Pick a quality and hit record.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Scissors,
    step: "02",
    title: "Edit",
    description: "Trim the edges, split sections, adjust audio, and pick the perfect thumbnail.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: HardDriveUpload,
    step: "03",
    title: "Upload to Drive",
    description: "One click sends your video straight to Google Drive with live progress.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Share2,
    step: "04",
    title: "Share",
    description: "Copy the shareable link and send it to anyone, anywhere, instantly.",
    color: "from-amber-500 to-orange-500",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Simple workflow
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four steps from idea to shared video. No software to install, no account required to start.
          </p>
        </div>

        <div className="mt-20 relative">
          {/* Connecting line */}
          <div className="absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-6 w-fit">
                  <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} shadow-xl`}>
                    <step.icon className="h-9 w-9 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground/60 mb-1">STEP {step.step}</div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
