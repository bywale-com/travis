"use client";

import { useEffect } from "react";
import { Room } from "@/components/Room";
import { ModeDoor } from "@/components/plates/ModeDoor";
import { AntShell } from "@/theme/AntShell";
import { useCharacter } from "@/theme/character";

export function TravisApp() {
  const { t, picked, hydrated, resetPick } = useCharacter();

  useEffect(() => {
    document.body.style.background = t.bgPrimary;
    document.body.style.color = t.textPrimary;
  }, [t]);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: t.bgPrimary,
        }}
      />
    );
  }

  return (
    <AntShell t={t}>
      {picked ? <Room t={t} onCharacter={resetPick} /> : <ModeDoor />}
    </AntShell>
  );
}
