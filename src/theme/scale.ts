/**
 * Plant — the type scale and spacing the plates are drawn on.
 *
 * Geometry does not move between Mission and Carbon. Only tokens move. These
 * numbers are the geometry, so they live outside the theme and take no mode.
 */

export const TYPE = {
  display: 32,
  title: 22,
  body: 16,
  meta: 12,
} as const;

/** 4pt base. Nothing should invent a gap that is not on this ladder. */
export const SPACE = [4, 8, 12, 16, 24, 32] as const;

export type SpaceStep = (typeof SPACE)[number];
