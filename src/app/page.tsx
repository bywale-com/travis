"use client";

import { Room } from "@/components/Room";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { AntShell } from "@/theme/AntShell";
import { light } from "@/theme/tokens";

export default function HomePage() {
  return (
    <AntShell t={light}>
      <SurfaceBoundary id="room" label="Room" order={1}>
        <Room t={light} />
      </SurfaceBoundary>
    </AntShell>
  );
}
