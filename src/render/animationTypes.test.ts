import { describe, expect, test } from "bun:test";
import { easeOutCubic, evaluatePawnAnim } from "./animationTypes.ts";
import type { PawnAnim } from "./animationTypes.ts";

describe("easeOutCubic", () => {
  test("f(0) = 0", () => expect(easeOutCubic(0)).toBe(0));
  test("f(1) = 1", () => expect(easeOutCubic(1)).toBe(1));
  test("is greater than linear at midpoint (ease-out front-loads progress)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
  test("is monotonically increasing", () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map(easeOutCubic);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThan(samples[i - 1]!);
    }
  });
});

describe("evaluatePawnAnim", () => {
  const anim: PawnAnim = {
    team: "white",
    startPx: 0,
    startPy: 0,
    endPx: 100,
    endPy: 200,
    startTime: 1000,
    duration: 500,
  };

  test("at startTime returns start position", () => {
    const { px, py } = evaluatePawnAnim(anim, 1000);
    expect(px).toBeCloseTo(0);
    expect(py).toBeCloseTo(0);
  });

  test("at startTime + duration returns end position", () => {
    const { px, py } = evaluatePawnAnim(anim, 1500);
    expect(px).toBeCloseTo(100);
    expect(py).toBeCloseTo(200);
  });

  test("beyond duration clamps to end position", () => {
    const { px, py } = evaluatePawnAnim(anim, 99999);
    expect(px).toBeCloseTo(100);
    expect(py).toBeCloseTo(200);
  });

  test("midway applies easeOutCubic interpolation", () => {
    // t = 0.5 → easeOutCubic(0.5) = 1 - 0.5^3 = 0.875
    const { px, py } = evaluatePawnAnim(anim, 1250);
    expect(px).toBeCloseTo(87.5);
    expect(py).toBeCloseTo(175);
  });
});
