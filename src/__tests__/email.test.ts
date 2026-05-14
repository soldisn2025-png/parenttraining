import { describe, expect, it } from "vitest";
import { buildAssignmentEmail, getAssignmentEmailSubject } from "@/lib/email";

describe("assignment email content", () => {
  it("uses the approved Walktogether subject", () => {
    expect(getAssignmentEmailSubject()).toBe("Your practice plan for this week is ready");
  });

  it("keeps the email short, parent-friendly, and linked to the assignment", () => {
    const email = buildAssignmentEmail({
      firstName: "Maria",
      assignmentUrl: "https://walktogetheraba.com/assignment/token-123",
      ttlDays: 14,
    });

    expect(email.text).toContain("Hi Maria,");
    expect(email.text).toContain("https://walktogetheraba.com/assignment/token-123");
    expect(email.text).toContain("14 days");
    expect(email.text).not.toMatch(/diagnosis|target behavior|clinical/i);
    expect(email.html).toContain("See your plan");
  });
});
