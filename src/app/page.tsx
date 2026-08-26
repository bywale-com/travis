"use client";

import { VoiceSession } from "@/components/VoiceSession";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { light } from "@/theme/tokens";

export default function HomePage() {
  return (
    <SurfaceBoundary id="voice-session" label="Voice session" order={1}>
      <VoiceSession t={light} />
    </SurfaceBoundary>
  );
}
