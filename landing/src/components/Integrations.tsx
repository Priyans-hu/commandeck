"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Github,
  MessageSquare,
  Check,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LinearIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.1 13.32a10.28 10.28 0 0 0 8.58 8.58L2.1 13.32ZM1.76 10.62a10.3 10.3 0 0 0 11.62 11.62L1.76 10.62ZM4.15 4.15a10.29 10.29 0 0 0 .52 14.2L18.35 4.67a10.29 10.29 0 0 0-14.2-.52ZM22.24 13.38a10.3 10.3 0 0 1-11.62-11.62l11.62 11.62ZM21.9 10.68a10.28 10.28 0 0 1-8.58-8.58L21.9 10.68ZM19.85 19.85a10.29 10.29 0 0 0-.52-14.2L5.65 19.33a10.29 10.29 0 0 0 14.2.52Z" />
    </svg>
  );
}

interface Integration {
  name: string;
  icon: LucideIcon | null;
  customIcon?: boolean;
  authDescription: string;
  scopes?: string[];
  linkLabel: string;
  linkHref: string;
  capabilities: string[];
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  {
    name: "GitHub",
    icon: Github,
    authDescription: "Connect with a Personal Access Token (PAT)",
    scopes: ["repo", "read:user"],
    linkLabel: "Generate token",
    linkHref: "https://github.com/settings/tokens",
    capabilities: ["PRs", "Reviews", "CI status", "Diffs"],
  },
  {
    name: "Linear",
    icon: null,
    customIcon: true,
    authDescription: "Connect with a personal API key",
    linkLabel: "Get API key",
    linkHref: "https://linear.app/settings/api",
    capabilities: ["Tickets", "Assignments", "Status updates", "Team boards"],
  },
  {
    name: "Slack",
    icon: MessageSquare,
    authDescription: "Will use a Slack bot token",
    linkLabel: "Create app",
    linkHref: "https://api.slack.com/apps",
    capabilities: ["Mentions", "DMs", "Channel updates"],
    comingSoon: true,
  },
];

function IntegrationCard({
  integration,
  index,
}: {
  integration: Integration;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = integration.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface-card",
        "transition-all duration-300",
        "hover:border-accent/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-glow",
        integration.comingSoon && "opacity-60"
      )}
    >
      {/* Accent top border */}
      <div className="h-1 w-full bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-accent-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-6">
        {/* Header: icon + name + badge */}
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            {integration.customIcon ? (
              <LinearIcon className="h-6 w-6 text-accent-light" />
            ) : Icon ? (
              <Icon className="h-6 w-6 text-accent-light" />
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-text-primary">
              {integration.name}
            </h3>
            {integration.comingSoon && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-light">
                Coming Soon
              </span>
            )}
          </div>
        </div>

        {/* Auth description */}
        <p className="mb-3 text-sm text-text-secondary">
          {integration.authDescription}
        </p>

        {/* Scopes */}
        {integration.scopes && (
          <div className="mb-4 flex flex-wrap gap-2">
            {integration.scopes.map((scope) => (
              <code
                key={scope}
                className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-text-muted"
              >
                {scope}
              </code>
            ))}
          </div>
        )}

        {/* Capabilities */}
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            What you get
          </p>
          <ul className="space-y-1.5">
            {integration.capabilities.map((cap) => (
              <li
                key={cap}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-accent-light" />
                {cap}
              </li>
            ))}
          </ul>
        </div>

        {/* Token link */}
        <a
          href={integration.linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium text-accent-light transition-colors hover:text-accent",
            integration.comingSoon &&
              "pointer-events-none text-text-muted"
          )}
        >
          {integration.linkLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Integrations() {
  return (
    <section id="integrations" className="relative py-24 sm:py-32">
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
            Integrations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-text-secondary"
          >
            Connect your tools in seconds. Each integration uses a personal
            token &mdash; no OAuth apps, no admin approval needed.
          </motion.p>
        </div>

        {/* Integration cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, i) => (
            <IntegrationCard
              key={integration.name}
              integration={integration}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
