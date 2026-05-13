import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { extractTags } from "@/lib/tags";
import { rankVideos, scoreVideo, selectVideos } from "@/lib/matcher";

describe("matcher", () => {
  it("extracts keyword tags from staff prompts", () => {
    expect(extractTags("Child grabs toys and has no eye contact at snack")).toEqual(
      expect.arrayContaining(["requesting", "reducing grabbing", "joint attention", "meals & snack"])
    );
  });

  it("returns normalized scores between 0 and 1", () => {
    const score = scoreVideo(catalog.B01, ["requesting", "reducing grabbing"]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("prioritizes F/A beginner supports when tags are broad", () => {
    const ranked = rankVideos([]);
    expect(["F", "A"]).toContain(ranked[0].video.module);
  });

  it("selects between 3 and 5 videos and never exceeds cap", () => {
    expect(selectVideos(["requesting"])).toHaveLength(3);
    expect(selectVideos(["requesting"], 5)).toHaveLength(5);
    expect(selectVideos(["requesting"], 99)).toHaveLength(5);
  });
});
