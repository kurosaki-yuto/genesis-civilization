"use client";

import type { RegisteredUser } from "@/lib/types";

interface Props {
  users: RegisteredUser[];
}

export default function RegisteredUsers({ users }: Props) {
  if (users.length === 0) return null;

  return (
    <div className="panel">
      <div className="panel-title">登録住民</div>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.uid} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent1)] to-[var(--accent2)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {u.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{u.name}</div>
              <div className="text-[10px] text-[var(--muted)]">{u.trait}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
