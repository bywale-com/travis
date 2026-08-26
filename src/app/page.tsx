"use client";

import { Room } from "@/components/Room";
import { SurfaceBoundary } from "@/surfaces/SurfaceBoundary";
import { light } from "@/theme/tokens";

export default function HomePage() {
  return (
    <SurfaceBoundary id="room" label="Room" order={1}>
      <Room t={light} />
    </SurfaceBoundary>
  );
}
