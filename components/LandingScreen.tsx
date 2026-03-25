"use client";

interface Props {
  hasWorld: boolean;
  userCount: number;
  onAdmin: () => void;
  onUser: () => void;
}

export default function LandingScreen({ hasWorld, userCount, onAdmin, onUser }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="setup-world-orb mb-8 scale-90" aria-hidden />
      <h1 className="text-3xl sm:text-4xl font-black text-center text-[var(--text)] leading-tight">
        関西の<span className="text-[var(--accent2)]">世界</span>
      </h1>
      <p className="mt-3 text-[var(--text-secondary)] text-center max-w-md leading-relaxed">
        管理者が世界を定義し、ユーザーが登録すると、その人たちが地図の上で勝手に働きます。
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <button
          type="button"
          onClick={onAdmin}
          className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent1)] p-6 text-left transition-colors"
        >
          <div className="text-xs font-bold tracking-[0.2em] text-[var(--accent1)] uppercase">管理者</div>
          <div className="mt-2 text-xl font-bold text-[var(--text)]">世界をつくる・全体を見る</div>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            名前・目標・創造主を決めて、この関西を運営する側の画面です。
          </p>
        </button>

        <button
          type="button"
          onClick={onUser}
          disabled={!hasWorld}
          className={`rounded-2xl border-2 p-6 text-left transition-colors ${
            hasWorld
              ? "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent2)]"
              : "border-[var(--border)] opacity-50 cursor-not-allowed bg-[var(--surface)]"
          }`}
        >
          <div className="text-xs font-bold tracking-[0.2em] text-[var(--accent2)] uppercase">ユーザー</div>
          <div className="mt-2 text-xl font-bold text-[var(--text)]">登録して、この世界で働く</div>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            {hasWorld
              ? `あなたの分身が人の形で動きます。登録済み ${userCount} 人`
              : "先に管理者が世界を設定するまで、登録できません。"}
          </p>
        </button>
      </div>
    </div>
  );
}
