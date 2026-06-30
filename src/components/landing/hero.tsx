"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, Mic, Monitor, Webcam, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustItems = [
  { label: "No watermarks", icon: Shield },
  { label: "100% browser-based", icon: Sparkles },
  { label: "Free forever", icon: PlayCircle },
];

const floatingIcons = [
  { Icon: Monitor, className: "top-[15%] left-[8%]", delay: 0 },
  { Icon: Mic, className: "bottom-[20%] left-[15%]", delay: 0.4 },
  { Icon: Webcam, className: "top-[25%] right-[10%]", delay: 0.2 },
  { Icon: Sparkles, className: "bottom-[25%] right-[12%]", delay: 0.6 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-8rem] h-96 w-96 rounded-full bg-pink-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-500 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Premium screen recording, reimagined
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px]">NEW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Record, Edit & Share
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Videos in Seconds
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-pretty text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Capture your screen, webcam, and microphone. Edit instantly and upload
            directly to Google Drive with one click.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-[52px] w-full px-7 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40 text-base sm:w-auto"
            >
              <Link href="/record" className="inline-flex items-center justify-center">
                Start Recording Free
                <ArrowRight className="ml-2 h-[18px] w-[18px]" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-[52px] w-full px-7 rounded-2xl border-border/70 bg-background/70 text-base font-semibold shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-accent/80 sm:w-auto"
            >
              <Link href="/#how-it-works" className="inline-flex items-center justify-center">
                <PlayCircle className="mr-2 h-[18px] w-[18px]" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust items */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            {trustItems.map((item) => (
              <div key={item.label} className="inline-flex items-center gap-2">
                <item.icon className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          {/* Floating icons */}
          {floatingIcons.map(({ Icon, className, delay }, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
              className={`absolute z-20 hidden md:block ${className}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-strong shadow-xl">
                <Icon className="h-5 w-5 text-purple-500" />
              </div>
            </motion.div>
          ))}

          {/* Glow */}
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 blur-3xl" />

          {/* App window mockup */}
          <div className="rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="ml-3 flex-1">
                <div className="h-6 w-40 rounded-md bg-muted/40" />
              </div>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-950">
              {/* Mock recording UI */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative mx-auto h-20 w-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-purple-500/30 border-t-purple-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-mono text-purple-400">REC 00:42</p>
                </div>
              </div>
              {/* Webcam bubble */}
              <div className="absolute bottom-4 right-4 h-24 w-24 rounded-full border-2 border-purple-500 bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center">
                <Webcam className="h-8 w-8 text-white/70" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 p-5">
              {["Trim & Edit", "Upload to Drive", "Share Link"].map((label) => (
                <div key={label} className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center">
                  <p className="text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
