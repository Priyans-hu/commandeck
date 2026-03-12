"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tech {
  name: string;
  description: string;
  initial: string;
}

const stack: Tech[] = [
  { name: "Tauri v2", description: "Lightweight native shell", initial: "T" },
  { name: "React 19", description: "Declarative UI", initial: "R" },
  { name: "Rust", description: "Fast, safe backend", initial: "Rs" },
  { name: "TypeScript", description: "Type-safe frontend", initial: "TS" },
  { name: "SQLite", description: "Local-first data", initial: "SQ" },
  { name: "Tailwind CSS", description: "Utility-first styling", initial: "TW" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function TechStack() {
  return (
    <section id="tech-stack" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
          >
            Built with the best
          </motion.h2>
        </div>

        {/* Tech pills */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {stack.map((tech) => (
            <motion.div
              key={tech.name}
              variants={pillVariants}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-surface-card px-5 py-3.5",
                "transition-colors duration-200 hover:border-border-bright hover:bg-surface-hover"
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent-light">
                {tech.initial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {tech.name}
                </p>
                <p className="text-xs text-text-muted">{tech.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
