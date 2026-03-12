"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I used to have Linear, GitHub, and Slack open in three separate windows. CommanDeck collapsed all of that into one sidebar. My context-switching dropped to almost zero.",
    name: "Arjun Mehta",
    role: "Senior Engineer at a YC Startup",
    initials: "AM",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    quote:
      "The AI dispatch feature is unreal. I click one button on a ticket and Claude just starts writing the code. It feels like having a junior engineer on-call 24/7.",
    name: "Sarah Chen",
    role: "Tech Lead, Platform Team",
    initials: "SC",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    quote:
      "Seeing my PRs and Linear tickets in one place finally gave me a clear picture of what's actually in flight. Review bottlenecks became obvious overnight.",
    name: "Daniel Kowalski",
    role: "Engineering Manager",
    initials: "DK",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    quote:
      "It's a native desktop app that actually feels native. No Electron bloat, no browser tab graveyard. Just a clean, fast dashboard that stays out of my way.",
    name: "Priya Nair",
    role: "IC at Series A Startup",
    initials: "PN",
    color: "bg-amber-500/20 text-amber-400",
  },
];

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-surface-card p-6",
        "transition-all duration-300",
        "hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-glow"
      )}
    >
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-accent-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Quote mark */}
        <span className="mb-3 select-none text-4xl font-bold leading-none text-accent/20">
          &ldquo;
        </span>

        {/* Quote text */}
        <p className="flex-1 text-sm leading-relaxed text-text-secondary">
          {testimonial.quote}
        </p>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
          {/* Avatar placeholder */}
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              testimonial.color
            )}
          >
            {testimonial.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {testimonial.name}
            </p>
            <p className="text-xs text-text-secondary">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
          >
            What developers are saying
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-text-secondary"
          >
            Early feedback from our beta testers
          </motion.p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
