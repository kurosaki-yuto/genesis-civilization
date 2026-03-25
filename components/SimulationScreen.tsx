"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import WorldCanvas, { type WorldCanvasHandle } from "./WorldCanvas";
import TopBar from "./HUD/TopBar";
import SidePanel from "./HUD/SidePanel";
import EventLog from "./HUD/EventLog";
import StoryPanel from "./HUD/StoryPanel";
import CinematicOverlay from "./CinematicOverlay";
import { fmtPop } from "@/lib/format";
import {
  ERAS,
  createSettlement,
  spawnEntity,
  doTick,
} from "@/lib/simulation";
import { fmtYear } from "@/lib/format";
import type {
  SimState,
  Entity,
  Settlement,
  LogEntry,
  RegisteredUser,
} from "@/lib/types";

interface Props {
  userName: string;
  creatorTrait: string;
  adam: string;
  adamT: string;
  eve: string;
  eveT: string;
  goal: string;
  registeredUsers: RegisteredUser[];
}

export default function SimulationScreen({
  userName, creatorTrait, adam, adamT, eve, eveT, goal, registeredUsers,
}: Props) {
  const canvasRef = useRef<WorldCanvasHandle>(null);
  const [speed, setSpeed] = useState(1);
  const [state, setState] = useState<SimState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [connections, setConnections] = useState<[Settlement, Settlement, number][]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [story, setStory] = useState<{
    title: string; text: string; year: number; era: string;
  } | null>(null);
  const [cinematic, setCinematic] = useState<{
    title: string; subtitle: string;
  } | null>(null);
  const [showHud, setShowHud] = useState(false);

  const stateRef = useRef<SimState | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const settlementsRef = useRef<Settlement[]>([]);
  const aiGenerating = useRef(false);
  const spawnedUserUids = useRef<Set<string>>(new Set());

  const addLog = useCallback((year: number, text: string, major = false) => {
    setLogs((prev) => [{ year, text, major }, ...prev].slice(0, 100));
  }, []);

  // Initialize simulation
  useEffect(() => {
    const waitForCanvas = () => {
      const handle = canvasRef.current;
      if (!handle) {
        requestAnimationFrame(waitForCanvas);
        return;
      }
      const { w, h } = handle.getSize();
      if (w === 0) {
        requestAnimationFrame(waitForCanvas);
        return;
      }

      const land = handle.nearestLand(w / 2, h / 2);
      const s0 = createSettlement([], land.x, land.y, "始まりの地");
      s0.pop = 2;
      s0.displayPop = 2;

      const initialEntities: Entity[] = [
        {
          x: land.x - 8, y: land.y, tx: land.x, ty: land.y,
          vx: 0, vy: 0, name: adam, gen: 0,
          color: "#a855f7", size: 5, age: 0, maxAge: 99999,
        },
        {
          x: land.x + 8, y: land.y, tx: land.x, ty: land.y,
          vx: 0, vy: 0, name: eve, gen: 0,
          color: "#ec4899", size: 5, age: 0, maxAge: 99999,
        },
      ];

      const initialState: SimState = {
        userName, adam, eve, adamT, eveT, goal,
        creatorTrait: creatorTrait || "創造",
        year: -100000, pop: 2, era: ERAS[0],
        techs: [], logs: [], progress: 0,
        generation: 0, births: 0, deaths: 0,
        discoveries: 0, tickCount: 0,
      };

      stateRef.current = initialState;
      entitiesRef.current = initialEntities;
      settlementsRef.current = [s0];
      setState(initialState);
      setEntities(initialEntities);
      setSettlements([s0]);

      setCinematic({ title: `${adam}と${eve}`, subtitle: "文明の種が蒔かれた" });
    };
    requestAnimationFrame(waitForCanvas);
  }, [adam, adamT, eve, eveT, goal, userName, creatorTrait]);

  const handleCinematicDone = useCallback(() => {
    setCinematic(null);
    if (!showHud) {
      setShowHud(true);
      const S = stateRef.current;
      if (S) {
        addLog(S.year, `${adam}と${eve}が出会った。すべてはここから始まる。`, true);
        addLog(S.year, `創造主 ${userName} が文明に方向を与えた:「${goal}」`, true);
      }
    }
  }, [showHud, adam, eve, userName, goal, addLog]);

  // Spawn registered users as entities
  useEffect(() => {
    if (!stateRef.current || settlementsRef.current.length === 0) return;
    for (const user of registeredUsers) {
      if (spawnedUserUids.current.has(user.uid)) continue;
      spawnedUserUids.current.add(user.uid);
      const s = settlementsRef.current[(Math.random() * settlementsRef.current.length) | 0];
      const entity = spawnEntity(
        s.x + (Math.random() - 0.5) * 40,
        s.y + (Math.random() - 0.5) * 40,
        stateRef.current.generation,
        user.name,
        true,
        user.uid
      );
      entity.color = "#ec4899";
      entitiesRef.current.push(entity);
      setEntities([...entitiesRef.current]);
      addLog(stateRef.current.year, `【住民登録】${user.name} がこの文明に加わった`, true);
    }
    // state: 初期化完了後に再実行（先に registeredUsers だけ届いた場合の取りこぼし防止）
  }, [registeredUsers, addLog, state]);

  // Simulation tick
  useEffect(() => {
    if (!state) return;

    const interval = setInterval(() => {
      const S = stateRef.current;
      const ents = entitiesRef.current;
      const setts = settlementsRef.current;
      const handle = canvasRef.current;
      if (!S || !handle || speed === 0) return;

      for (let i = 0; i < speed; i++) {
        const { w, h } = handle.getSize();
        const result = doTick(S, setts, ents, w, h, handle.nearestLand);

        if (result.newSettlement) {
          addLog(S.year, `新たな集落「${result.newSettlement.name}」が誕生した`);
        }
        if (result.eraChanged) {
          const era = result.eraChanged.newEra;
          fetchEpoch(S, era.n);
        }
        for (const d of result.newDiscoveries) {
          addLog(S.year, `【発見】${d}`);
        }
        for (const ev of result.localEvents) {
          addLog(S.year, ev);
        }
        if (result.story) {
          setStory({
            title: result.story.t,
            text: result.story.s,
            year: S.year,
            era: S.era.n,
          });
        }
      }

      // AI events
      if (S.tickCount % 30 === 0 && !aiGenerating.current) {
        fetchAIEvents(S, setts);
      }

      // Update connections
      const conns: [Settlement, Settlement, number][] = [];
      const { w } = handle.getSize();
      for (let i = 0; i < setts.length; i++) {
        for (let j = i + 1; j < setts.length; j++) {
          const d = Math.hypot(setts[i].x - setts[j].x, setts[i].y - setts[j].y);
          if (d < w * 0.25) conns.push([setts[i], setts[j], d]);
        }
      }

      setState({ ...S });
      setEntities([...ents]);
      setSettlements([...setts]);
      setConnections(conns);
    }, 80);

    return () => clearInterval(interval);
  }, [state, speed, addLog]);

  const fetchAIEvents = async (S: SimState, setts: Settlement[]) => {
    aiGenerating.current = true;
    try {
      const statePayload = {
        year: fmtYear(S.year), era: S.era.n, pop: fmtPop(S.pop),
        adam: S.adam, adamT: S.adamT, eve: S.eve, eveT: S.eveT,
        goal: S.goal, creatorTrait: S.creatorTrait,
        techs: S.techs, settlements: setts.map((s) => s.name),
        generation: S.generation,
      };
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: statePayload }),
      });
      const d = await r.json();
      if (d.error) { aiGenerating.current = false; return; }
      if (d.events) {
        for (const ev of d.events) {
          addLog(S.year, `${ev.title ? "【" + ev.title + "】" : ""}${ev.text}`, ev.impact === "positive");
        }
      }
      if (d.newDiscovery && !S.techs.includes(d.newDiscovery)) {
        S.techs.push(d.newDiscovery);
        S.discoveries++;
        addLog(S.year, `【AI発見】${d.newDiscovery}`, true);
      }
      if (d.storyFragment) {
        setStory({
          title: "AIが紡ぐ物語",
          text: d.storyFragment,
          year: S.year,
          era: S.era.n,
        });
      }
    } catch {
      // AI unavailable, continue with local events
    }
    aiGenerating.current = false;
  };

  const fetchEpoch = async (S: SimState, eraName: string) => {
    try {
      const statePayload = {
        adam: S.adam, eve: S.eve, goal: S.goal,
        pop: fmtPop(S.pop), techs: S.techs,
      };
      const r = await fetch("/api/epoch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: statePayload, newEra: eraName }),
      });
      const d = await r.json();
      setCinematic({
        title: d.title || eraName,
        subtitle: d.subtitle || "新たな時代",
      });
      addLog(S.year, `【${eraName}】${d.description || "が始まった"}`, true);
    } catch {
      setCinematic({ title: eraName, subtitle: "新たな時代の幕開け" });
      addLog(S.year, `【${eraName}】が始まった`, true);
    }
  };

  return (
    <>
      <WorldCanvas
        ref={canvasRef}
        entities={entities}
        settlements={settlements}
        connections={connections}
        eraColor={state?.era.c || "#a855f7"}
        running={!!state}
      />

      {/* Population labels */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        {settlements.map((s) =>
          s.displayPop < 5 ? null : (
            <div
              key={s.id}
              className="absolute text-[11px] font-bold text-white whitespace-nowrap"
              style={{
                left: s.x - 30,
                top: s.y - s.size * 4 - 16,
                color: s.color,
                textShadow: "0 0 8px rgba(0,0,0,.8)",
              }}
            >
              {s.name} {fmtPop(s.displayPop)}
            </div>
          )
        )}
      </div>

      {cinematic && (
        <CinematicOverlay
          title={cinematic.title}
          subtitle={cinematic.subtitle}
          onDone={handleCinematicDone}
        />
      )}

      {showHud && state && (
        <div className="fixed inset-0 z-10 pointer-events-none animate-[fadeIn_1s]">
          <div className="pointer-events-auto">
            <TopBar state={state} speed={speed} onSpeedChange={setSpeed} />
            <SidePanel
              state={state}
              settlements={settlements}
              registeredUsers={registeredUsers}
            />
            <StoryPanel story={story} />
            <EventLog logs={logs} />
          </div>
        </div>
      )}
    </>
  );
}
