"use client";

import { useState, useEffect, useCallback } from "react";
import IntroScreen from "@/components/IntroScreen";
import SetupScreen from "@/components/SetupScreen";
import SimulationScreen from "@/components/SimulationScreen";
import { subscribeToUsers } from "@/lib/firebase";
import type { Phase, RegisteredUser } from "@/lib/types";

interface SetupData {
  userName: string;
  creatorTrait: string;
  adam: string;
  adamT: string;
  eve: string;
  eveT: string;
  goal: string;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const unsub = subscribeToUsers(setRegisteredUsers);
    return () => unsub();
  }, []);

  const handleIntroComplete = useCallback(() => setPhase("setup"), []);

  const handleBegin = useCallback((data: SetupData) => {
    setSetupData(data);
    setPhase("simulation");
  }, []);

  return (
    <>
      {phase === "intro" && <IntroScreen onComplete={handleIntroComplete} />}
      {phase === "setup" && <SetupScreen onBegin={handleBegin} />}
      {phase === "simulation" && setupData && (
        <SimulationScreen
          userName={setupData.userName}
          creatorTrait={setupData.creatorTrait}
          adam={setupData.adam}
          adamT={setupData.adamT}
          eve={setupData.eve}
          eveT={setupData.eveT}
          goal={setupData.goal}
          registeredUsers={registeredUsers}
        />
      )}
    </>
  );
}
