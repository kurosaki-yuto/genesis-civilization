"use client";

import { fmtYear } from "@/lib/format";
import type { LogEntry } from "@/lib/types";

interface Props {
  logs: LogEntry[];
}

export default function EventLog({ logs }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-[300px] max-h-[200px] overflow-y-auto px-6 py-4 bg-gradient-to-b from-transparent via-[rgba(7,7,14,.5)] to-[rgba(7,7,14,.95)]">
      {logs.slice(0, 50).map((log, i) => (
        <div key={i} className="flex gap-3 py-1 animate-[logIn_.6s]">
          <span className="text-xs text-[var(--accent1)] font-bold whitespace-nowrap min-w-[80px]">
            {fmtYear(log.year)}
          </span>
          <span className={`text-xs leading-relaxed ${log.major ? "text-[var(--accent3)] font-semibold" : "text-[var(--text)]"}`}>
            {log.text}
          </span>
        </div>
      ))}
    </div>
  );
}
