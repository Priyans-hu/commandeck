"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link, Eye, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Link,
    title: "Connect",
    description:
      "Link your GitHub and Linear accounts with a personal token. Takes 30 seconds.",
  },
  {
    icon: Eye,
    title: "View",
    description:
      "Your tickets, PRs, and mentions appear in a unified dashboard. Filter, search, and sort.",
  },
  {
    icon: Zap,
    title: "Dispatch",
    description:
      "Click 'Assign to AI' on any ticket. Claude Code reads the context and starts coding.",
  },
];

function StepCard({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
      className="relative flex flex-1 flex-col items-center text-center"
    >
      {/* Dotted connector line — horizontal on desktop, vertical on mobile */}
      {!isLast && (
        <>
          {/* Desktop: horizontal line */}
          <div className="pointer-events-none absolute top-8 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] border-t-2 border-dashed border-border-bright lg:block" />
          {/* Mobile: vertical line */}
          <div className="pointer-events-none absolute top-[calc(100%+0.25rem)] left-1/2 block h-8 -translate-x-1/2 border-l-2 border-dashed border-border-bright lg:hidden" />
        </>
      )}

      {/* Step number */}
      <span className="mb-4 text-5xl font-extrabold text-accent/20">
        {index + 1}
      </span>

      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
        <Icon className="h-6 w-6 text-accent-light" />
      </div>

      {/* Content */}
      <h3 className="mb-2 text-xl font-semibold text-text-primary">
        {step.title}
      </h3>
      <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
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
            Get started in minutes
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-8">
          {steps.map((step, i) => (
            <StepCard
              key={step.title}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
