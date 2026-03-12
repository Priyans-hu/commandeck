"use client";

import { motion } from "framer-motion";
import { Layers, Github } from "lucide-react";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Priyans-hu",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/priyans-hu",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/shotbypriyanshu",
  },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Left — Logo + credit */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Layers className="h-4.5 w-4.5 text-accent-light" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary">
                Comman<span className="text-accent-light">Deck</span>
              </span>
              <span className="text-xs text-text-muted">
                Built by Priyanshu
              </span>
            </div>
          </div>

          {/* Center — Social links */}
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right — License */}
          <p className="text-sm text-text-muted">
            Open Source &mdash; MIT License
          </p>
        </div>

        {/* Bottom — Copyright */}
        <div className="mt-8 border-t border-border/50 pt-6 text-center">
          <p className="text-xs text-text-muted">
            &copy; 2025 CommanDeck. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
