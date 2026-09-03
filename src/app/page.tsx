"use client";

import { TravisApp } from "@/components/TravisApp";
import { CharacterProvider } from "@/theme/character";

export default function HomePage() {
  return (
    <CharacterProvider>
      <TravisApp />
    </CharacterProvider>
  );
}
