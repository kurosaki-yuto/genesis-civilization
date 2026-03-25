"use client";

import { fmtYear } from "@/lib/format";
import type { LogEntry } from "@/lib/types";

interface Props {
  logs: LogEntry[];
}

export default function EventLog({ logs }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 sm:right-[min(360px,42vw)] max-h-[min(40vh,280px)] overflow-y-auto px-4 sm:px-6 py-5 border-t-2 border-[var(--border)] bg-[rgba(5,10,18,.88)] backdrop-blur-md">
      <div className="text-xs font-bold tracking-[0.2em] text-[var(--accent1)] uppercase mb-3">
        年代記
      </div>
      <div className="space-y-2">
        {logs.slice(0, 40).map((log, i) => (
          <div key={i} className="flex gap-3 sm:gap-4 py-1 animate-[logIn_.45s]">
            <span className="text-sm font-bold text-[var(--accent2)] whitespace-nowrap min-w-[5.5rem] tabular-nums">
              {fmtYear(log.year)}
            </span>
            <span
              className={`text-sm sm:text-base leading-relaxed ${
                log.major ? "text-[var(--accent3)] font-semibold" : "text-[var(--text-secondary)]"
              }`}
            >
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
