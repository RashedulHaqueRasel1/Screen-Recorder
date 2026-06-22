"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "RecStudio replaced three tools for our team. Record, edit, and share — all in one tab. The Google Drive integration is a game-changer.",
    author: "Sarah Chen",
    role: "Product Designer, Linear",
    initials: "SC",
    color: "from-indigo-500 to-purple-500",
  },
  {
    quote:
      "The video editor is shockingly capable for a browser app. I trimmed a 20-minute demo in seconds and uploaded it straight to Drive.",
    author: "Marcus Rodriguez",
    role: "Engineering Lead, Vercel",
    initials: "MR",
    color: "from-emerald-500 to-teal-500",
  },
  {
    quote:
      "Finally, a screen recorder that just works. No downloads, no watermarks, no fuss. The UI feels like it was designed by Apple.",
    author: "Emily Watson",
    role: "Founder, Bloom",
    initials: "EW",
    color: "from-amber-500 to-orange-500",
  },
  {
    quote:
      "We use RecStudio daily for async standups. The webcam bubble and one-click sharing cut our meeting time in half.",
    author: "David Kim",
    role: "CTO, Notion",
    initials: "DK",
    color: "from-rose-500 to-pink-500",
  },
  {
    quote:
      "The quality at 1080p is exceptional. Recordings look professional without any post-processing.",
    author: "Aisha Patel",
    role: "Content Creator",
    initials: "AP",
    color: "from-cyan-500 to-sky-500",
  },
  {
    quote:
      "I've tried Loom, ScreenPal, everything. RecStudio wins on simplicity and speed. Setup took 10 seconds.",
    author: "Tom Bridge",
    role: "Educator, Coursera",
    initials: "TB",
    color: "from-violet-500 to-fuchsia-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Loved by creators
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Trusted by modern teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of creators, educators, and teams who record with RecStudio.
          </p>
        </div>

        <div className="mt-16 columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="break-inside-avoid rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 hover:border-border/80 transition-colors"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-white text-xs font-semibold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
