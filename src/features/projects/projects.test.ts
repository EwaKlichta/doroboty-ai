import { describe, expect, it } from "vitest";
import { initialState, stateSchema, transition } from "../prototype/model";
import { emptyProject, projectSchema } from "./schema";

const project = {
  ...emptyProject,
  title: "Sorting requests",
  problem: "Slow manual categorization",
  role: "Process analyst",
  actions: "I designed and tested four rules",
  team: "A developer integrated the rules",
  result: "24 of 30 classifications matched; production time unknown",
  materialMode: "private" as const,
  materialDescription: "Client data is confidential; I can explain a rule.",
};
const candidate = () => transition(initialState(), { type: "select_person", id: "candidate-anna" });
const submit = {
  type: "submit" as const,
  jobId: initialState().jobs[0].id,
  notes: "",
  generated: "",
  answer: "I designed and tested a request categorization workflow.",
  consent: true,
  attachProject: true,
};

describe("candidate-owned project and submitted evidence", () => {
  it("loads old state without projects and rejects unknown or duplicate owners", () => {
    const { projects: _projects, ...legacy } = initialState();
    expect(_projects).toEqual([]);
    expect(stateSchema.parse(legacy).projects).toEqual([]);
    expect(
      stateSchema.safeParse({ ...legacy, projects: [{ candidateId: "missing", value: project }] })
        .success,
    ).toBe(false);
    expect(
      stateSchema.safeParse({
        ...legacy,
        projects: [
          { candidateId: "candidate-anna", value: project },
          { candidateId: "candidate-anna", value: project },
        ],
      }).success,
    ).toBe(false);
  });
  it("keeps an incomplete draft but cannot attach it", () => {
    const s = transition(candidate(), { type: "project", value: emptyProject });
    expect(s.projects).toHaveLength(1);
    expect(() => transition(s, submit)).toThrow();
    expect(
      transition(s, { ...submit, attachProject: false }).applications.at(-1)?.project,
    ).toBeUndefined();
  });
  it("snapshots only the current candidate's project and preserves it after edits and roundtrip", () => {
    let s = transition(candidate(), { type: "project", value: project });
    s = transition(s, submit);
    s = transition(s, { type: "project", value: { ...project, actions: "A later draft" } });
    expect(
      stateSchema.parse(JSON.parse(JSON.stringify(s))).applications.at(-1)?.project?.actions,
    ).toBe(project.actions);
    s = transition(s, { type: "select_person", id: "candidate-marek" });
    expect(() => transition(s, { ...submit, jobId: s.jobs[1].id })).toThrow();
  });
  it("rejects employer editing and unsafe material links", () => {
    const s = transition(initialState(), { type: "select_person", id: "employer-brightlabs" });
    expect(() => transition(s, { type: "project", value: project })).toThrow();
    for (const materialUrl of [
      "javascript:alert(1)",
      "http://example.com",
      "https://user:password@example.com",
      "not a URL",
    ])
      expect(
        projectSchema.safeParse({ ...project, materialMode: "link", materialUrl }).success,
      ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...project,
        materialMode: "link",
        materialUrl: "https://example.com/project",
      }).success,
    ).toBe(true);
    expect(projectSchema.safeParse(project).success).toBe(true);
  });
});
