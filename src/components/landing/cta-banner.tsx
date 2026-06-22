"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 py-16 sm:px-16 sm:py-20 text-center"
        >
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-500 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Start in seconds
          </div>

          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl max-w-2xl mx-auto">
            Ready to create your first recording?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of creators who trust RecStudio for fast, beautiful screen recordings.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-13 px-7 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] text-base"
            >
              <Link href="/record">
                Get Started Free
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 px-7 rounded-2xl text-base font-semibold">
              <Link href="/#features">Explore Features</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">No credit card required • Free forever plan</p>
        </motion.div>
      </div>
    </section>
  );
}
