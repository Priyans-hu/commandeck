"use client";

import { motion } from "framer-motion";

const sidebarItems = [
  { active: false, width: "w-6" },
  { active: true, width: "w-6" },
  { active: false, width: "w-6" },
  { active: false, width: "w-6" },
  { active: false, width: "w-6" },
];

const tickets = [
  {
    status: "bg-success",
    title: "w-36 sm:w-48",
    tag: "w-14 sm:w-16",
    tagColor: "bg-accent/15 text-accent-light",
    assignee: "bg-accent",
  },
  {
    status: "bg-warning",
    title: "w-28 sm:w-40",
    tag: "w-12 sm:w-14",
    tagColor: "bg-warning/15 text-warning",
    assignee: "bg-success",
  },
  {
    status: "bg-accent-light",
    title: "w-32 sm:w-44",
    tag: "w-16 sm:w-20",
    tagColor: "bg-success/15 text-success",
    assignee: "bg-warning",
  },
  {
    status: "bg-danger",
    title: "w-24 sm:w-36",
    tag: "w-14 sm:w-16",
    tagColor: "bg-danger/15 text-danger",
    assignee: "bg-accent-light",
  },
  {
    status: "bg-success",
    title: "w-40 sm:w-52",
    tag: "w-10 sm:w-12",
    tagColor: "bg-accent/15 text-accent-light",
    assignee: "bg-danger",
  },
  {
    status: "bg-warning",
    title: "w-30 sm:w-38",
    tag: "w-14 sm:w-18",
    tagColor: "bg-warning/15 text-warning",
    assignee: "bg-success",
  },
];

export default function DashboardMockup() {
  return (
    <motion.div
      whileHover={{ rotateX: -1, rotateY: 1, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className="w-full"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-2xl shadow-black/40">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-4 flex-1">
            <div className="mx-auto h-5 max-w-[200px] rounded-md bg-surface-hover" />
          </div>
          <div className="w-[52px]" />
        </div>

        {/* App body */}
        <div className="flex h-[280px] sm:h-[340px] md:h-[400px]">
          {/* Sidebar */}
          <div className="hidden w-12 flex-shrink-0 flex-col items-center gap-3 border-r border-border bg-surface px-2 pt-4 sm:flex sm:w-14">
            {sidebarItems.map((item, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9 ${
                  item.active
                    ? "bg-accent/15 ring-1 ring-accent/30"
                    : "bg-surface-hover"
                }`}
              >
                <div
                  className={`h-3.5 ${item.width} rounded-sm ${
                    item.active ? "bg-accent-light" : "bg-text-muted/40"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col">
            {/* Content header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-text-primary/20 sm:w-28" />
                <div className="hidden h-5 w-px bg-border sm:block" />
                <div className="hidden h-3.5 w-16 rounded bg-text-muted/30 sm:block" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-16 rounded-md bg-surface-hover sm:w-20" />
                <div className="h-7 w-7 rounded-md bg-surface-hover" />
              </div>
            </div>

            {/* Ticket rows */}
            <div className="flex-1 overflow-hidden">
              {tickets.map((ticket, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 transition-colors hover:bg-surface-hover/50 sm:px-5 sm:py-3"
                >
                  <div
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${ticket.status}`}
                  />
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className={`h-3 rounded bg-text-primary/15 ${ticket.title}`}
                    />
                    <div
                      className={`hidden h-5 rounded-full px-1 sm:block ${ticket.tag} ${ticket.tagColor}`}
                    >
                      <div className="h-full w-full rounded-full opacity-0" />
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 flex-shrink-0 rounded-full ${ticket.assignee} opacity-60 sm:h-6 sm:w-6`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right detail panel */}
          <div className="hidden w-52 flex-shrink-0 flex-col border-l border-border bg-surface/60 p-4 lg:flex xl:w-64">
            {/* Detail header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <div className="h-3.5 w-24 rounded bg-text-primary/20" />
            </div>
            {/* Detail fields */}
            <div className="flex flex-col gap-3.5">
              {[
                { label: "w-12", value: "w-20" },
                { label: "w-10", value: "w-24" },
                { label: "w-14", value: "w-16" },
                { label: "w-8", value: "w-28" },
              ].map((field, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div
                    className={`h-2.5 rounded bg-text-muted/30 ${field.label}`}
                  />
                  <div
                    className={`h-3 rounded bg-text-primary/10 ${field.value}`}
                  />
                </div>
              ))}
            </div>
            {/* Detail action */}
            <div className="mt-auto">
              <div className="h-8 w-full rounded-lg bg-accent/10 ring-1 ring-accent/20" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
