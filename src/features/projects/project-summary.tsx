import { ExternalLink, FileText } from "lucide-react";
import type { ProjectDraft } from "./schema";

export function ProjectSummary({ project }: { project: ProjectDraft }) {
  return (
    <article className="project-summary" aria-label="Opis projektu kandydata">
      <header>
        <span className="project-eyebrow">
          <FileText size={16} aria-hidden="true" /> Projekt kandydata
        </span>
        <h2>{project.title || "Projekt bez tytułu"}</h2>
        <p>{project.role || "Nie podano roli"}</p>
      </header>
      <p className="project-source">
        Opis i materiały pochodzą od kandydata. Nie zostały niezależnie zweryfikowane.
      </p>
      <dl>
        {(
          [
            ["Problem do rozwiązania", project.problem],
            ["Własne działania", project.actions],
            ["Wkład innych osób", project.team],
            ["Rezultat i sposób sprawdzenia", project.result],
          ] as const
        ).map(([title, content]) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{content || "Brak informacji — warto dopytać."}</dd>
          </div>
        ))}
      </dl>
      <section className="project-material">
        <h3>
          {project.materialMode === "link"
            ? "Materiał i jego znaczenie"
            : "Opis bez udostępnionego materiału"}
        </h3>
        {project.materialMode === "link" && project.materialUrl.startsWith("https://") && (
          <a href={project.materialUrl} target="_blank" rel="noopener noreferrer">
            Otwórz materiał <ExternalLink size={16} aria-hidden="true" />
            <span className="sr-only"> (nowa karta)</span>
          </a>
        )}
        {project.materialMode === "private" && (
          <span className="project-pill">Materiał poufny</span>
        )}
        {project.materialMode === "none" && <span className="project-pill">Bez materiału</span>}
        <p>{project.materialDescription || "Nie opisano materiału ani powodu jego braku."}</p>
        <small>
          {project.materialMode === "link"
            ? "Sam link nie potwierdza autorstwa ani kompetencji."
            : "Brak publicznego materiału nie oznacza braku umiejętności."}
        </small>
      </section>
    </article>
  );
}
