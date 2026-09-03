"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { carbon, mission, type Tokens } from "@/theme/tokens";

export type Character = "mission" | "carbon";

const STORAGE = "travis-character";

function readStored(): Character | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE);
  if (raw === "carbon" || raw === "mission") return raw;
  return null;
}

type Ctx = {
  character: Character;
  t: Tokens;
  picked: boolean;
  matchSystem: boolean;
  setCharacter: (c: Character) => void;
  setMatchSystem: (on: boolean) => void;
  confirmPick: () => void;
  resetPick: () => void;
  hydrated: boolean;
};

const CharacterContext = createContext<Ctx | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, setCharacterState] = useState<Character>("mission");
  const [picked, setPicked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [matchSystem, setMatchSystemState] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setCharacterState(stored);
      setPicked(true);
    }
    setHydrated(true);
  }, []);

  const setCharacter = useCallback((c: Character) => {
    setCharacterState(c);
    setMatchSystemState(false);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE, c);
  }, []);

  const setMatchSystem = useCallback((on: boolean) => {
    setMatchSystemState(on);
    if (!on) return;
    const dark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next: Character = dark ? "carbon" : "mission";
    setCharacterState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE, next);
  }, []);

  const confirmPick = useCallback(() => {
    setPicked(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE, character);
    }
  }, [character]);

  const resetPick = useCallback(() => {
    setPicked(false);
  }, []);

  const t = character === "carbon" ? carbon : mission;

  const value = useMemo(
    () => ({
      character,
      t,
      picked,
      matchSystem,
      setCharacter,
      setMatchSystem,
      confirmPick,
      resetPick,
      hydrated,
    }),
    [
      character,
      t,
      picked,
      matchSystem,
      setCharacter,
      setMatchSystem,
      confirmPick,
      resetPick,
      hydrated,
    ],
  );

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter(): Ctx {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter requires CharacterProvider");
  return ctx;
}
