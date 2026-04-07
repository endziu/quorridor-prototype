import type { Team } from "../types.ts";

export interface PawnAnim {
  readonly team: Team;
  readonly startPx: number;
  readonly startPy: number;
  readonly endPx: number;
  readonly endPy: number;
  readonly startTime: number;
  readonly duration: number;
}

export interface WallAnim {
  readonly wallIndex: number;
  readonly startTime: number;
  readonly duration: number;
}

export function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

export function evaluatePawnAnim(anim: PawnAnim, now: number): { px: number; py: number } {
  const t = easeOutCubic(Math.min((now - anim.startTime) / anim.duration, 1));
  return {
    px: anim.startPx + (anim.endPx - anim.startPx) * t,
    py: anim.startPy + (anim.endPy - anim.startPy) * t,
  };
}
