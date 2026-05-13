import { describe, expect, it } from "vitest";
import { selectVideos } from "@/lib/matcher";
import { createGeneratedPlan, assertWithinVideoCap, transitionStatus } from "@/lib/plan";
import { hashPrompt, normalizeEmail } from "@/lib/security";
import { toVideoId } from "@/types/domain";

describe("plan and security helpers", () => {
  it("hashes prompts without returning raw prompt text", () => {
    const hash = hashPrompt("Child grabs at snack");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("Child grabs");
  });

  it("normalizes parent email", () => {
    expect(normalizeEmail(" Kelly@Example.COM ")).toBe("kelly@example.com");
  });

  it("creates draft plans with immutable system selections and final order", () => {
    const scoredVideos = selectVideos(["requesting"]);
    const plan = createGeneratedPlan({
      promptHash: hashPrompt("requesting"),
      scoredVideos,
      rationale: "A short rationale.",
      weeklyGuidance: [],
    });
    expect(plan.reviewStatus).toBe("draft");
    expect(plan.systemSelectedVideos).toEqual(plan.finalVideoOrder);
    expect(plan.recommendedVideos).toEqual(plan.finalVideoOrder);
    expect(plan.finalVideoOrder.length).toBeLessThanOrEqual(5);
  });

  it("enforces final video cap", () => {
    expect(() =>
      assertWithinVideoCap(["A01", "A02", "A03", "A04", "A05", "A06"].map(toVideoId))
    ).toThrow("5 videos");
  });

  it("enforces send transition from approved only", () => {
    expect(transitionStatus("draft", "approve")).toBe("approved");
    expect(transitionStatus("approved", "send")).toBe("sent");
    expect(() => transitionStatus("revised", "send")).toThrow("approved");
  });
});
