"use client";

import { useState } from "react";
import AuthButton from "./AuthButton";

interface SetupData {
  userName: string;
  creatorTrait: string;
  adam: string;
  adamT: string;
  eve: string;
  eveT: string;
  goal: string;
}

interface Props {
  onBegin: (data: SetupData) => void;
}

const TRAITS = [
  { val: "創造", emoji: "🔥", label: "創造の力" },
  { val: "調和", emoji: "🌊", label: "調和の美" },
  { val: "知性", emoji: "⚡", label: "知性の光" },
  { val: "自由", emoji: "🌪️", label: "自由の風" },
  { val: "愛", emoji: "💎", label: "愛の結晶" },
  { val: "進化", emoji: "🌱", label: "進化の種" },
];

const GOALS = [
  { v: "争いなき永遠の平和", label: "永久平和" },
  { v: "全意識の統合と超越", label: "意識の超越" },
  { v: "自然と完全に融合した文明", label: "自然融合" },
  { v: "宇宙の果てへの到達", label: "宇宙進出" },
  { v: "美と芸術で世界を塗り替える", label: "芸術至上" },
  { v: "あらゆる生命の共存と進化", label: "共生進化" },
  { v: "時間と空間の支配", label: "時空支配" },
  { v: "感情を超えた純粋な論理世界", label: "純粋論理" },
];

const TEMPERAMENTS = ["勇猛", "聡明", "慈愛", "狡猾", "夢想"];

export default function SetupScreen({ onBegin }: Props) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [creatorTrait, setCreatorTrait] = useState("");
  const [adam, setAdam] = useState("タケル");
  const [adamT, setAdamT] = useState("勇猛");
  const [eve, setEve] = useState("ヒカリ");
  const [eveT, setEveT] = useState("聡明");
  const [goal, setGoal] = useState("");
  const [goalText, setGoalText] = useState("");

  const totalSteps = 3;

  const handleBegin = () => {
    onBegin({
      userName: userName || "創造主",
      creatorTrait: creatorTrait || "創造",
      adam: adam || "α",
      adamT,
      eve: eve || "β",
      eveT,
      goal: goalText || goal || "未知への到達",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,7,14,.92)] backdrop-blur-[40px]">
      <div className="w-[min(580px,92vw)] max-h-[90vh] overflow-y-auto">
        {/* Step dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-10 h-1 rounded transition-colors ${
                i < step
                  ? "bg-[var(--accent1)]"
                  : i === step
                    ? "bg-[var(--accent2)]"
                    : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Creator */}
        {step === 0 && (
          <div className="animate-[fadeUp_.5s]">
            <h2 className="text-3xl font-black mb-1 bg-gradient-to-br from-[var(--accent1)] to-[var(--accent2)] bg-clip-text text-transparent">
              あなたは誰か
            </h2>
            <p className="text-[var(--muted)] mb-6 text-sm">
              この文明の創造主として、まず自分自身を定義せよ
            </p>

            <div className="mb-4">
              <AuthButton />
            </div>

            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                あなたの名前
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="名前を入力"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none focus:border-[var(--accent1)] focus:shadow-[0_0_20px_var(--glow1)] transition-all"
              />
            </div>

            <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
              あなたが信じるもの
            </label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {TRAITS.map((t) => (
                <button
                  key={t.val}
                  onClick={() => setCreatorTrait(t.val)}
                  className={`bg-[var(--surface)] border rounded-[10px] p-3 text-center cursor-pointer transition-all text-sm hover:border-[var(--accent1)] hover:-translate-y-0.5 ${
                    creatorTrait === t.val
                      ? "border-[var(--accent2)] bg-[rgba(236,72,153,.1)] shadow-[0_0_20px_var(--glow2)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <span className="text-xl block mb-1">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setStep(1)} className="btn btn-primary">
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Founders */}
        {step === 1 && (
          <div className="animate-[fadeUp_.5s]">
            <h2 className="text-3xl font-black mb-1 bg-gradient-to-br from-[var(--accent1)] to-[var(--accent2)] bg-clip-text text-transparent">
              始祖を選べ
            </h2>
            <p className="text-[var(--muted)] mb-6 text-sm">
              すべての始まりとなる二人を定義せよ
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                  始祖 α
                </label>
                <input
                  value={adam}
                  onChange={(e) => setAdam(e.target.value)}
                  placeholder="名前"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none focus:border-[var(--accent1)] focus:shadow-[0_0_20px_var(--glow1)] transition-all mb-3"
                />
                <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                  気質
                </label>
                <select
                  value={adamT}
                  onChange={(e) => setAdamT(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none focus:border-[var(--accent1)] transition-all"
                >
                  {TEMPERAMENTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                  始祖 β
                </label>
                <input
                  value={eve}
                  onChange={(e) => setEve(e.target.value)}
                  placeholder="名前"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none focus:border-[var(--accent1)] focus:shadow-[0_0_20px_var(--glow1)] transition-all mb-3"
                />
                <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                  気質
                </label>
                <select
                  value={eveT}
                  onChange={(e) => setEveT(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none focus:border-[var(--accent1)] transition-all"
                >
                  {TEMPERAMENTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setStep(0)} className="btn btn-ghost">
                戻る
              </button>
              <button onClick={() => setStep(2)} className="btn btn-primary">
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="animate-[fadeUp_.5s]">
            <h2 className="text-3xl font-black mb-1 bg-gradient-to-br from-[var(--accent1)] to-[var(--accent2)] bg-clip-text text-transparent">
              文明の方向性
            </h2>
            <p className="text-[var(--muted)] mb-6 text-sm">
              この文明はどこへ向かうのか。人類の歴史をなぞる必要はない。
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {GOALS.map((g) => (
                <button
                  key={g.v}
                  onClick={() => {
                    setGoal(g.v);
                    setGoalText(g.v);
                  }}
                  className={`bg-[var(--surface)] border rounded-full px-4 py-2 text-sm cursor-pointer transition-all ${
                    goal === g.v
                      ? "border-[var(--accent3)] text-[var(--accent3)] bg-[rgba(249,115,22,.1)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent3)] hover:text-[var(--accent3)]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-[.2em] text-[var(--accent1)] mb-2 font-semibold">
                または自由に記述
              </label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="あなただけの文明の目標を書け"
                className="w-full h-20 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3 text-white outline-none resize-none focus:border-[var(--accent1)] focus:shadow-[0_0_20px_var(--glow1)] transition-all"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setStep(1)} className="btn btn-ghost">
                戻る
              </button>
              <button onClick={handleBegin} className="btn btn-primary">
                創 世 開 始
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
