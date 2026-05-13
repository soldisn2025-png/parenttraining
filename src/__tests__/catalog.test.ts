import { describe, expect, it } from "vitest";
import { catalog, catalogVersion, videos } from "@/data/catalog";

describe("catalog", () => {
  it("has exactly 45 videos and no duplicate ids", () => {
    const ids = videos.map((video) => video.id);
    expect(videos).toHaveLength(45);
    expect(new Set(ids).size).toBe(45);
  });

  it("enforces module counts", () => {
    expect(videos.filter((video) => video.module === "F")).toHaveLength(6);
    expect(videos.filter((video) => video.module === "A")).toHaveLength(7);
    expect(videos.filter((video) => video.module === "C")).toHaveLength(8);
    expect(videos.filter((video) => video.module === "T")).toHaveLength(11);
    expect(videos.filter((video) => video.module === "S")).toHaveLength(7);
    expect(videos.filter((video) => video.module === "B")).toHaveLength(6);
  });

  it("stores videos as a Record for O(1) lookup", () => {
    expect(catalog.F01.title).toContain("following your child's lead");
  });

  it("has required non-empty fields", () => {
    for (const video of videos) {
      expect(video.title).toBeTruthy();
      expect(video.durationRange).toBeTruthy();
      expect(video.opening).toBeTruthy();
      expect(video.keyPoints).toHaveLength(3);
      expect(video.demoScene).toBeTruthy();
      expect(video.homePractice).toBeTruthy();
      expect(video.routineTags.length).toBeGreaterThan(0);
      expect(video.targetSkillTags.length).toBeGreaterThan(0);
    }
    expect(catalogVersion).toBeTruthy();
  });
});
