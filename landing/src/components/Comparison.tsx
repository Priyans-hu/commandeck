"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const painPoints = [
  "10+ browser tabs open all day",
  "Manually check GitHub for PR reviews",
  "Switch to Linear for ticket updates",
  "Jump to Slack for team messages",
  "Copy-paste context to AI tools",
  "Lose focus every 5 minutes",
];

const benefits = [
  "One unified dashboard",
  "PR reviews with inline diffs",
  "Tickets with one-click AI dispatch",
  "Team updates in your feed",
  "AI reads context automatically",
  "Deep focus, zero tab-switching",
];

function ComparisonCard({
  variant,
  items,
  index,
}: {
  variant: "without" | "with";
  items: string[];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const isPositive = variant === "with";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={cn(
        "relative rounded-xl border p-6 sm:p-8",
        "transition-all duration-300",
        isPositive
          ? "border-success/20 bg-success/[0.04] hover:border-success/40 hover:shadow-lg hover:shadow-success/5"
          : "border-danger/20 bg-danger/[0.04] hover:border-danger/30"
      )}
    >
      {/* Subtle gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl opacity-30",
          isPositive
            ? "bg-gradient-to-br from-success/5 to-transparent"
            : "bg-gradient-to-br from-danger/5 to-transparent"
        )}
      />

      <div className="relative z-10">
        {/* Card heading */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              isPositive ? "bg-success/15" : "bg-danger/15"
            )}
          >
            {isPositive ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <X className="h-5 w-5 text-danger" />
            )}
          </div>
          <h3
            className={cn(
              "text-lg font-semibold",
              isPositive ? "text-success" : "text-danger"
            )}
          >
            {isPositive ? "With CommanDeck" : "Without CommanDeck"}
          </h3>
        </div>

        {/* Items list */}
        <ul className="space-y-4">
          {items.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: isPositive ? 20 : -20 }}
              animate={
                isInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: isPositive ? 20 : -20 }
              }
              transition={{
                duration: 0.4,
                delay: index * 0.15 + i * 0.08 + 0.2,
                ease: "easeOut",
              }}
              className="flex items-start gap-3"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                  isPositive
                    ? "bg-success/15 text-success"
                    : "bg-danger/15 text-danger"
                )}
              >
                {isPositive ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  isPositive ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {item}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Comparison() {
  return (
    <section id="comparison" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
          >
            The difference is clear
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-text-secondary"
          >
            Stop context-switching between a dozen tools.
            <br className="hidden sm:block" />
            Start shipping from a single pane of glass.
          </motion.p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ComparisonCard variant="without" items={painPoints} index={0} />
          <ComparisonCard variant="with" items={benefits} index={1} />
        </div>
      </div>
    </section>
  );
}
