"use client";

import { motion } from "framer-motion";
import { Download, Github, ArrowRight } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-left purple orb */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[120px]" />
        {/* Top-right cyan orb */}
        <div className="absolute -right-24 top-20 h-[400px] w-[400px] rounded-full bg-cyan-500/6 blur-[100px]" />
        {/* Center purple glow behind mockup */}
        <div className="absolute left-1/2 top-[60%] h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[150px]" />
        {/* Bottom-left accent orb */}
        <div className="absolute -bottom-20 left-1/4 h-[300px] w-[300px] rounded-full bg-accent-light/6 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 md:pt-48 md:pb-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface-card/80 px-4 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-sm sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Now in active development
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">Your unified</span>
            <span className="block">
              <span className="bg-gradient-to-r from-accent via-accent-light to-cyan-400 bg-clip-text text-transparent">
                command center
              </span>{" "}
              for
            </span>
            <span className="block">engineering work</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:mt-8 sm:text-lg md:text-xl"
          >
            One dashboard for tickets, pull requests, AI coding sessions, and
            team updates. Stop drowning in browser tabs. Start shipping what
            matters.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <a
              href="https://github.com/Priyans-hu/commandeck/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30 sm:text-base"
            >
              <Download className="h-4.5 w-4.5" />
              Download for macOS
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/Priyans-hu/commandeck"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-text-secondary transition-all duration-200 hover:border-border-bright hover:bg-surface-hover hover:text-text-primary sm:text-base"
            >
              <Github className="h-4.5 w-4.5" />
              View on GitHub
            </a>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="relative mt-16 w-full max-w-5xl sm:mt-20 md:mt-24"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-accent/10 via-accent/5 to-transparent blur-2xl sm:-inset-8" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 via-transparent to-cyan-500/5 blur-xl" />
            <div className="relative">
              <DashboardMockup />
            </div>
            {/* Bottom fade */}
            <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent sm:h-32" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
