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
  return 1 - Math.pow(1 - t, 3);
}
