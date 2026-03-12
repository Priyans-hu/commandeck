"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ListTodo,
  GitPullRequest,
  Sparkles,
  Activity,
  Inbox,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ListTodo,
    title: "Linear Tickets",
    description:
      "View, triage, and update tickets. Filter by status, priority, or team. Never open Linear in a browser tab again.",
  },
  {
    icon: GitPullRequest,
    title: "GitHub PRs",
    description:
      "Review diffs inline, approve with one click, track CI status. Your review queue, always visible.",
  },
  {
    icon: Sparkles,
    title: "AI Task Dispatch",
    description:
      "Assign any ticket to Claude Code. It reads the context, writes the code, and reports back. One click to automate.",
  },
  {
    icon: Activity,
    title: "Session Tracking",
    description:
      "Monitor running AI sessions, review completed diffs, retry failures. Your AI mission control.",
  },
  {
    icon: Inbox,
    title: "Unified Inbox",
    description:
      "PRs, tickets, and mentions in one chronological feed. Sorted by urgency, not by tool.",
  },
  {
    icon: Users,
    title: "Team Views",
    description:
      "Switch between IC and manager perspectives. See team workload, review bottlenecks, unblock people.",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border border-border bg-surface-card p-6",
        "transition-all duration-300",
        "hover:border-accent/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-glow"
      )}
    >
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-accent-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent-light" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
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
            Everything you need,
            <br />
            nothing you don&apos;t
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-text-secondary"
          >
            CommanDeck integrates your core workflow tools into a single,
            distraction-free interface.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
