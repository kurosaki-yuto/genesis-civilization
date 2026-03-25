"use client";

import { fmtYear } from "@/lib/format";

interface Props {
  story: { title: string; text: string; year: number; era: string } | null;
}

export default function StoryPanel({ story }: Props) {
  if (!story) return null;

  return (
    <div className="absolute bottom-[210px] left-6 w-[300px]">
      <div className="bg-[rgba(14,14,26,.85)] backdrop-blur-[20px] border border-[var(--border)] rounded-[14px] p-4 animate-[logIn_.6s]">
        <div className="text-[10px] uppercase tracking-[.2em] text-[var(--accent2)] mb-1 font-semibold">
          {story.title}
        </div>
        <div className="text-xs leading-relaxed text-[var(--text)]">
          {story.text}
        </div>
        <div className="text-[11px] text-[var(--muted)] mt-1">
          {fmtYear(story.year)} — {story.era}
        </div>
      </div>
    </div>
  );
}
