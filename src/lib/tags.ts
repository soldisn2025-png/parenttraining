export const KEYWORD_TAG_MAP: Record<string, string[]> = {
  grabs: ["requesting", "reducing grabbing"],
  grabbing: ["requesting", "reducing grabbing"],
  "no eye contact": ["joint attention", "social engagement"],
  "eye contact": ["joint attention", "social engagement"],
  "doesn't request": ["requesting", "initiation"],
  "not requesting": ["requesting", "initiation"],
  mealtime: ["meals & snack"],
  snack: ["meals & snack"],
  meal: ["meals & snack"],
  imitation: ["imitation"],
  copying: ["imitation"],
  play: ["functional play", "floor play"],
  toys: ["functional play", "floor play"],
  bath: ["bath time"],
  bedtime: ["bedtime"],
  tantrum: ["emotional regulation"],
  meltdown: ["emotional regulation"],
  rigid: ["flexibility"],
  transition: ["flexibility"],
  sibling: ["sibling play"],
  request: ["requesting"],
  language: ["expressive language"],
  words: ["expressive language"],
  communication: ["expressive language", "initiation"],
  pretend: ["symbolic play"],
  turn: ["turn-taking"],
};

export function extractTags(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const tags = new Set<string>();
  for (const [keyword, mappedTags] of Object.entries(KEYWORD_TAG_MAP)) {
    if (lower.includes(keyword.toLowerCase())) {
      mappedTags.forEach((tag) => tags.add(tag));
    }
  }
  return Array.from(tags);
}
