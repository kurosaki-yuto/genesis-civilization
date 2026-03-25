"use client";

import { fmtYear } from "@/lib/format";

interface Props {
  story: { title: string; text: string; year: number; era: string } | null;
}

export default function StoryPanel({ story }: Props) {
  if (!story) return null;

  return (
    <div className="absolute bottom-[min(42vh,300px)] left-4 sm:left-6 right-4 sm:right-auto sm:w-[min(420px,calc(100vw-380px))] z-[11]">
      <div className="panel border-2 border-[var(--border-strong)] animate-[logIn_.5s]">
        <div className="text-xs font-bold tracking-[0.18em] text-[var(--accent2)] uppercase mb-2">
          {story.title}
        </div>
        <div className="text-base sm:text-lg leading-relaxed text-[var(--text)] font-medium">
          {story.text}
        </div>
        <div className="text-sm text-[var(--muted)] mt-3 font-medium">
          {fmtYear(story.year)} — {story.era}
        </div>
      </div>
    </div>
  );
}
