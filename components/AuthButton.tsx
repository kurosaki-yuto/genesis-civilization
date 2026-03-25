"use client";

import { useState, useEffect } from "react";
import { signInWithGoogle, signOut, onAuthChange } from "@/lib/firebase";
import type { User } from "firebase/auth";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthChange(setUser);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)]">{user.displayName}</span>
        <button
          onClick={signOut}
          className="text-xs px-3 py-1 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--accent1)] transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] text-white font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
    >
      {loading ? "接続中..." : "Googleでログイン"}
    </button>
  );
}
