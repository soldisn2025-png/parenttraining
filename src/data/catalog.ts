import { toVideoId, type Level, type Module, type Video, type VideoId } from "@/types/domain";

export const catalogVersion = "1.0.0";

const moduleLabels: Record<Module, string> = {
  F: "Focus",
  A: "Adjust",
  C: "Create",
  T: "Teach",
  S: "Shape",
  B: "Bonus",
};

const titles: Array<{
  id: string;
  module: Module;
  title: string;
  level: Level;
  routineTags: string[];
  targetSkillTags: string[];
}> = [
  { id: "F01", module: "F", title: "Why following your child's lead works", level: "Beginner", routineTags: ["floor play", "all routines"], targetSkillTags: ["social engagement", "joint attention"] },
  { id: "F02", module: "F", title: "How to observe before you interact", level: "Beginner", routineTags: ["floor play"], targetSkillTags: ["social engagement", "joint attention"] },
  { id: "F03", module: "F", title: "Joining your child in parallel play", level: "Beginner", routineTags: ["floor play", "toy play"], targetSkillTags: ["social engagement", "functional play"] },
  { id: "F04", module: "F", title: "Following your child's lead during toy play", level: "Beginner", routineTags: ["toy play"], targetSkillTags: ["joint attention", "functional play"] },
  { id: "F05", module: "F", title: "Following your child's lead during outdoor play", level: "Intermediate", routineTags: ["outdoor play"], targetSkillTags: ["social engagement", "joint attention"] },
  { id: "F06", module: "F", title: "Responding to your child's communication attempts", level: "Beginner", routineTags: ["all routines"], targetSkillTags: ["expressive language", "initiation"] },
  { id: "A01", module: "A", title: "Matching language to your child's level", level: "Beginner", routineTags: ["all routines"], targetSkillTags: ["expressive language"] },
  { id: "A02", module: "A", title: "Using animation to capture attention", level: "Beginner", routineTags: ["play", "meals & snack"], targetSkillTags: ["social engagement", "joint attention"] },
  { id: "A03", module: "A", title: "The power of pausing and waiting", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["initiation", "requesting"] },
  { id: "A04", module: "A", title: "Simplifying your language at meals", level: "Beginner", routineTags: ["meals & snack"], targetSkillTags: ["expressive language", "requesting"] },
  { id: "A05", module: "A", title: "Using gestures and visuals alongside words", level: "Beginner", routineTags: ["all routines"], targetSkillTags: ["expressive language", "joint attention"] },
  { id: "A06", module: "A", title: "Reducing questions and demands", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["social engagement", "emotional regulation"] },
  { id: "A07", module: "A", title: "Linguistic mapping during bath time", level: "Intermediate", routineTags: ["bath time"], targetSkillTags: ["expressive language"] },
  { id: "C01", module: "C", title: "Setting up the room to invite communication", level: "Beginner", routineTags: ["floor play"], targetSkillTags: ["initiation", "requesting"] },
  { id: "C02", module: "C", title: "Playful obstruction - gentle blocking to create a need", level: "Intermediate", routineTags: ["toy play"], targetSkillTags: ["requesting", "reducing grabbing"] },
  { id: "C03", module: "C", title: "Balanced turns - play goes back and forth", level: "Beginner", routineTags: ["toy play"], targetSkillTags: ["turn-taking", "social engagement"] },
  { id: "C04", module: "C", title: "Creating opportunities during snack time", level: "Beginner", routineTags: ["meals & snack"], targetSkillTags: ["requesting", "initiation"] },
  { id: "C05", module: "C", title: "Communicative temptations with familiar routines", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["requesting", "initiation"] },
  { id: "C06", module: "C", title: "Setting up opportunities for requesting during outdoor play", level: "Intermediate", routineTags: ["outdoor play"], targetSkillTags: ["requesting", "initiation"] },
  { id: "C07", module: "C", title: "Using books to create communication opportunities", level: "Beginner", routineTags: ["books", "bedtime"], targetSkillTags: ["expressive language", "joint attention"] },
  { id: "C08", module: "C", title: "Creating opportunities during getting dressed", level: "Intermediate", routineTags: ["dressing"], targetSkillTags: ["requesting", "expressive language"] },
  { id: "T01", module: "T", title: "How to model a word without pressuring a response", level: "Beginner", routineTags: ["all routines"], targetSkillTags: ["expressive language"] },
  { id: "T02", module: "T", title: "Expanding language: the +1 rule", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["expressive language"] },
  { id: "T03", module: "T", title: "Teaching imitation through play - motor actions", level: "Intermediate", routineTags: ["floor play"], targetSkillTags: ["imitation"] },
  { id: "T04", module: "T", title: "Teaching vocal imitation during play", level: "Advanced", routineTags: ["floor play"], targetSkillTags: ["imitation", "expressive language"] },
  { id: "T05", module: "T", title: "Prompting requesting - from gesture to word", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["requesting", "expressive language"] },
  { id: "T06", module: "T", title: "Teaching functional play with objects", level: "Intermediate", routineTags: ["toy play"], targetSkillTags: ["functional play"] },
  { id: "T07", module: "T", title: "Moving from functional to pretend play", level: "Advanced", routineTags: ["toy play"], targetSkillTags: ["symbolic play", "functional play"] },
  { id: "T08", module: "T", title: "Teaching commenting and labeling", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["expressive language", "joint attention"] },
  { id: "T09", module: "T", title: "Natural reinforcement - why it matters more than praise", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["requesting", "social engagement"] },
  { id: "T10", module: "T", title: "Fading prompts over time", level: "Advanced", routineTags: ["all routines"], targetSkillTags: ["independence", "initiation"] },
  { id: "T11", module: "T", title: "Teaching protesting appropriately", level: "Advanced", routineTags: ["all routines"], targetSkillTags: ["expressive language", "emotional regulation"] },
  { id: "S01", module: "S", title: "Reading the moment - when to prompt vs. when to wait", level: "Advanced", routineTags: ["all routines"], targetSkillTags: ["initiation", "joint attention"] },
  { id: "S02", module: "S", title: "Keeping interactions balanced and enjoyable", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["social engagement", "emotional regulation"] },
  { id: "S03", module: "S", title: "Combining follow-the-lead with language modeling", level: "Advanced", routineTags: ["floor play"], targetSkillTags: ["expressive language", "joint attention"] },
  { id: "S04", module: "S", title: "Handling low motivation and disengagement", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["social engagement"] },
  { id: "S05", module: "S", title: "Embedding strategies into bedtime routine", level: "Advanced", routineTags: ["bedtime"], targetSkillTags: ["expressive language", "requesting"] },
  { id: "S06", module: "S", title: "Embedding strategies into community settings", level: "Advanced", routineTags: ["community"], targetSkillTags: ["generalization", "requesting"] },
  { id: "S07", module: "S", title: "Playing with siblings - coaching the whole family", level: "Advanced", routineTags: ["sibling play"], targetSkillTags: ["sibling play", "turn-taking"] },
  { id: "B01", module: "B", title: "When your child grabs instead of asking", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["requesting", "reducing grabbing"] },
  { id: "B02", module: "B", title: "When your child cries or melts down during practice", level: "Intermediate", routineTags: ["all routines"], targetSkillTags: ["emotional regulation", "social engagement"] },
  { id: "B03", module: "B", title: "Handling rigidity and resistance to change", level: "Intermediate", routineTags: ["transition"], targetSkillTags: ["flexibility", "emotional regulation"] },
  { id: "B04", module: "B", title: "Self-care for parents - you cannot pour from an empty cup", level: "All", routineTags: ["parent support"], targetSkillTags: ["parent wellness"] },
  { id: "B05", module: "B", title: "How to set a weekly practice plan", level: "All", routineTags: ["home plan"], targetSkillTags: ["parent follow-through"] },
  { id: "B06", module: "B", title: "Celebrating small wins - what progress really looks like", level: "All", routineTags: ["reflection"], targetSkillTags: ["parent confidence"] },
];

function makeVideo(entry: (typeof titles)[number]): Video {
  const label = moduleLabels[entry.module];
  return {
    id: toVideoId(entry.id),
    module: entry.module,
    title: entry.title,
    durationRange: entry.level === "Advanced" ? "8-10 min" : "6-8 min",
    opening: `In this video, Kelly shows one small way to practice ${entry.targetSkillTags[0]} during ${entry.routineTags[0]}.`,
    keyPoints: [
      `Start with a short, comfortable ${entry.routineTags[0]} moment.`,
      `Use the ${label.toLowerCase()} strategy without adding pressure.`,
      "Watch for one small response and build from there.",
    ],
    demoScene: `Kelly or an RBT models this strategy in a natural ${entry.routineTags[0]} routine, then shows what to do when the child responds or needs more help.`,
    homePractice: `Try this once today during ${entry.routineTags[0]}. Keep it short, notice what worked, and bring one question to Kelly.`,
    level: entry.level,
    routineTags: entry.routineTags,
    targetSkillTags: entry.targetSkillTags,
    youtubeUrl: null,
    filmingStatus: "not_filmed",
  };
}

export const catalog: Record<VideoId, Video> = Object.fromEntries(
  titles.map((entry) => [entry.id, makeVideo(entry)])
) as Record<VideoId, Video>;

export const videos = Object.values(catalog);
