"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type SurfaceMeta = {
  id: string;
  label: string;
  order?: number;
  icon?: string;
};

type RegistryCtx = {
  surfaces: SurfaceMeta[];
  highlightId: string | null;
  register: (meta: SurfaceMeta) => () => void;
  setHighlightId: (id: string | null) => void;
};

const SurfaceRegistryContext = createContext<RegistryCtx | null>(null);

export function SurfaceRegistryProvider({ children }: { children: ReactNode }) {
  const [surfaces, setSurfaces] = useState<SurfaceMeta[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const register = useCallback((meta: SurfaceMeta) => {
    setSurfaces((prev) => {
      if (prev.some((s) => s.id === meta.id)) return prev;
      return [...prev, meta].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
    return () => {
      setSurfaces((prev) => prev.filter((s) => s.id !== meta.id));
    };
  }, []);

  const value = useMemo(
    () => ({ surfaces, highlightId, register, setHighlightId }),
    [surfaces, highlightId, register],
  );

  return (
    <SurfaceRegistryContext.Provider value={value}>
      {children}
    </SurfaceRegistryContext.Provider>
  );
}

export function useSurfaceRegistry() {
  const ctx = useContext(SurfaceRegistryContext);
  if (!ctx) {
    throw new Error("useSurfaceRegistry requires SurfaceRegistryProvider");
  }
  return ctx;
}

export function SurfaceBoundary({
  id,
  label,
  order,
  icon,
  children,
  className,
  style,
}: SurfaceMeta & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { register, highlightId } = useSurfaceRegistry();

  useEffect(() => register({ id, label, order, icon }), [register, id, label, order, icon]);

  return (
    <div
      data-surface-id={id}
      data-surface-label={label}
      className={className}
      style={{
        ...style,
        outline:
          highlightId === id ? "2px solid var(--travis-accent, #2f5d50)" : undefined,
        outlineOffset: highlightId === id ? 2 : undefined,
      }}
    >
      {children}
    </div>
  );
}
