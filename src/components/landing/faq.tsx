"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is RecStudio really free?",
    answer:
      "Yes! The Free plan includes unlimited recordings at 720p HD quality, Google Drive uploads, basic editing, and shareable links — forever. Upgrade to Pro anytime for 1080p Full HD and advanced editing tools.",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No. RecStudio runs entirely in your browser using modern web technologies like MediaRecorder API and FFmpeg WASM. There's nothing to download or install.",
  },
  {
    question: "Are my recordings private?",
    answer:
      "Absolutely. All recordings are processed locally in your browser. Nothing is uploaded to our servers. When you choose to upload, files go directly to your own Google Drive account.",
  },
  {
    question: "Can I record my webcam and screen at the same time?",
    answer:
      "Yes. You can record screen + microphone, screen + webcam, or screen + webcam + microphone. The webcam appears as a draggable floating bubble overlay, just like Loom.",
  },
  {
    question: "What video editing features are available?",
    answer:
      "Our in-browser editor lets you trim the start and end, split video into sections, mute or adjust volume, crop, select custom thumbnails, and rename your recordings — all powered by FFmpeg WASM.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "RecStudio works best on Chrome, Edge, and other Chromium-based browsers. Firefox is supported for most features. Safari has limited screen recording support due to browser restrictions.",
  },
  {
    question: "How does Google Drive integration work?",
    answer:
      "When you sign in with Google, you grant RecStudio permission to upload files to your Drive. Recordings upload directly with one click, and we automatically generate a shareable link for each file.",
  },
  {
    question: "Can I use RecStudio offline?",
    answer:
      "Recording and editing work offline once the app is loaded. However, Google Drive uploads and Google sign-in require an internet connection.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-4">
            Got questions?
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about RecStudio.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl px-5 data-[state=open]:border-purple-500/30"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
