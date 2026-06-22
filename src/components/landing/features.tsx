"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Webcam,
  Mic,
  Eye,
  Scissors,
  HardDriveUpload,
  Share2,
  History,
} from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Screen Recording",
    description: "Capture your entire screen, a specific window, or a single browser tab in stunning quality.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Webcam,
    title: "Webcam Recording",
    description: "Add a floating webcam bubble overlay. Position it anywhere on your recording.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Mic,
    title: "Audio Recording",
    description: "Record crystal-clear microphone narration alongside your screen capture.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Eye,
    title: "Instant Preview",
    description: "Preview your recording the moment you stop. No waiting, no rendering.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Scissors,
    title: "Video Editing",
    description: "Trim, split, mute, and adjust volume — all in your browser with FFmpeg WASM.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: HardDriveUpload,
    title: "Google Drive Upload",
    description: "One-click upload directly to your Google Drive with progress tracking.",
    color: "from-cyan-500 to-sky-500",
  },
  {
    icon: Share2,
    title: "Shareable Links",
    description: "Generate public share links instantly and copy them with one click.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: History,
    title: "Recording History",
    description: "Access every recording you've ever made, anytime, from your dashboard.",
    color: "from-fuchsia-500 to-pink-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Everything you need
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            A complete toolkit for
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"> video creation</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From capture to share, RecStudio handles the entire workflow in your browser.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 hover:border-border/80 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-5`}>
                <feature.icon className="h-5.5 w-5.5 text-white" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
