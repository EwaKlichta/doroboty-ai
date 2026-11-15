import { z } from "zod";

const body = z.string().max(3000);
export const projectDraftSchema = z.object({
  title: z.string().max(160),
  problem: body,
  role: z.string().max(200),
  actions: body,
  team: body,
  result: body,
  materialMode: z.enum(["link", "private", "none"]),
  materialUrl: z.string().max(1000),
  materialDescription: body,
});
export type ProjectDraft = z.infer<typeof projectDraftSchema>;
export const emptyProject: ProjectDraft = {
  title: "",
  problem: "",
  role: "",
  actions: "",
  team: "",
  result: "",
  materialMode: "link",
  materialUrl: "",
  materialDescription: "",
};
export const projectSchema = projectDraftSchema.superRefine((project, ctx) => {
  const required: (keyof ProjectDraft)[] = [
    "title",
    "problem",
    "role",
    "actions",
    "team",
    "result",
    "materialDescription",
  ];
  for (const key of required) {
    if (!project[key].trim())
      ctx.addIssue({
        code: "custom",
        path: [key],
        message:
          key === "result"
            ? "Opisz rezultat. Jeśli go nie znasz, napisz, czego jeszcze nie zmierzono."
            : "Uzupełnij to pole własnymi słowami.",
      });
  }
  if (project.materialMode === "link") {
    try {
      const url = new URL(project.materialUrl);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    } catch {
      ctx.addIssue({
        code: "custom",
        path: ["materialUrl"],
        message: "Wklej pełny link zaczynający się od https:// albo wybierz opis bez materiału.",
      });
    }
  }
});

export function projectErrors(project: ProjectDraft) {
  const result = projectSchema.safeParse(project);
  const errors: Partial<Record<keyof ProjectDraft, string>> = {};
  if (!result.success)
    for (const issue of result.error.issues)
      errors[issue.path[0] as keyof ProjectDraft] = issue.message;
  return errors;
}
