"use client";

import { motion } from "framer-motion";
import { Download, Github } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Radial glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[700px] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
        >
          Ready to take command?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg text-text-secondary"
        >
          Download CommanDeck and unify your engineering workflow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="https://github.com/Priyans-hu/commandeck/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
          >
            <Download className="h-5 w-5" />
            Download for macOS
          </a>
          <a
            href="https://github.com/Priyans-hu/commandeck"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-text-primary transition-all hover:border-border-bright hover:bg-surface-hover"
          >
            <Github className="h-5 w-5" />
            Star on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
