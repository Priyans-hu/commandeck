"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Download,
  FolderOpen,
  Rocket,
  Copy,
  Check,
  Terminal,
  Wrench,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "download", label: "Download", icon: Download, recommended: true },
  { id: "build", label: "Build from Source", icon: Wrench },
  { id: "dev", label: "Development", icon: Code2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-[#0a0c14]",
        className
      )}
    >
      <CopyButton text={code} />
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-sm leading-relaxed text-text-secondary">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  children,
  isLast,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-5">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute top-12 left-5 bottom-0 w-px border-l border-dashed border-border-bright" />
      )}
      {/* Number circle */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent-light ring-1 ring-accent/30">
        {number}
      </div>
      {/* Content */}
      <div className="min-w-0 flex-1 pb-8">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent-light" />
          <h4 className="text-base font-semibold text-text-primary">{title}</h4>
        </div>
        <div className="text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}

function DownloadTab() {
  return (
    <div className="space-y-1">
      <Step number={1} icon={Download} title="Download the latest release">
        <p className="mb-4">
          Grab the latest <code className="rounded bg-surface-hover px-1.5 py-0.5 text-accent-light">.dmg</code> file
          from GitHub Releases.
        </p>
        <a
          href="https://github.com/Priyans-hu/commandeck/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-accent/35"
        >
          <Download className="h-4.5 w-4.5" />
          Download for macOS
        </a>
        <p className="mt-3 text-xs text-text-muted">
          macOS 12 (Monterey) or later required
        </p>
      </Step>

      <Step number={2} icon={FolderOpen} title="Install the app">
        <p>
          Open the downloaded <code className="rounded bg-surface-hover px-1.5 py-0.5 text-accent-light">.dmg</code> file
          and drag CommanDeck into your Applications folder.
        </p>
      </Step>

      <Step number={3} icon={Rocket} title="Launch and connect" isLast>
        <p>
          Open CommanDeck from your Applications folder, then connect your
          GitHub and Linear accounts to get started.
        </p>
      </Step>
    </div>
  );
}

function BuildTab() {
  return (
    <div className="space-y-6">
      {/* Prerequisites */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Prerequisites
        </h4>
        <div className="flex flex-wrap gap-2">
          {["Node.js 20+", "Rust (stable)", "pnpm 10+"].map((req) => (
            <span
              key={req}
              className="rounded-md border border-border bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-secondary"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      {/* Build commands */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Build
        </h4>
        <CodeBlock
          code={`git clone https://github.com/Priyans-hu/commandeck.git
cd commandeck
pnpm install
pnpm tauri build`}
        />
      </div>

      {/* Output note */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-card p-4">
        <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
        <p className="text-sm text-text-secondary">
          The <code className="rounded bg-surface-hover px-1.5 py-0.5 text-accent-light">.dmg</code> will
          be in{" "}
          <code className="rounded bg-surface-hover px-1.5 py-0.5 text-text-secondary">
            src-tauri/target/release/bundle/dmg/
          </code>
        </p>
      </div>
    </div>
  );
}

function DevTab() {
  return (
    <div className="space-y-6">
      {/* Dev commands */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Start development server
        </h4>
        <CodeBlock
          code={`git clone https://github.com/Priyans-hu/commandeck.git
cd commandeck
pnpm install
pnpm tauri dev`}
        />
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-card p-4">
        <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p className="text-sm text-text-secondary">
          Hot reload enabled. Edit React files and see changes instantly.
        </p>
      </div>
    </div>
  );
}

const tabContent: Record<TabId, React.ComponentType> = {
  download: DownloadTab,
  build: BuildTab,
  dev: DevTab,
};

export default function Install() {
  const [activeTab, setActiveTab] = useState<TabId>("download");
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const ActiveContent = tabContent[activeTab];

  return (
    <section id="install" ref={ref} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Get started
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Install CommanDeck in under a minute.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-1 rounded-xl border border-border bg-surface-card p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="install-tab-bg"
                      className="absolute inset-0 rounded-lg bg-surface-hover border border-border-bright"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {"recommended" in tab && tab.recommended && (
                      <span className="hidden rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-light sm:inline">
                        Recommended
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-border bg-surface-card p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveContent />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
