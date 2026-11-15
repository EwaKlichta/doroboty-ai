import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Check, Eye, FolderOpen, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentPerson } from "../prototype/model";
import { usePrototype } from "../prototype/store";
import { emptyProject, projectErrors, projectSchema, type ProjectDraft } from "./schema";
import { ProjectSummary } from "./project-summary";
import "./projects.css";

const steps = ["Projekt", "Twój wkład", "Materiały", "Podgląd"];
const fieldsByStep: (keyof ProjectDraft)[][] = [
  ["title", "problem", "role"],
  ["actions", "team", "result"],
  ["materialUrl", "materialDescription"],
];

export function ProjectsPage() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const project = state.projects.find((item) => item.candidateId === person.id)?.value;
  const ready = project && projectSchema.safeParse(project).success;
  return (
    <div className="project-page">
      <div className="project-intro">
        <span className="project-eyebrow">Twoje doświadczenie, konkretnie</span>
        <h1>
          Pokaż, co potrafisz.
          <br />
          Na jednym projekcie.
        </h1>
        <p>
          Opowiedz, co było Twoją pracą i co z niej wynikło. Pracodawca zobaczy więcej niż listę
          narzędzi w CV.
        </p>
      </div>
      {project ? (
        <article className="project-card">
          <span className="project-pill">{ready ? "Gotowy do dołączenia" : "Szkic"}</span>
          <h2>{project.title || "Twój pierwszy projekt"}</h2>
          <p>{project.role || "Dopisz swoją rolę w projekcie."}</p>
          <Link className={buttonVariants()} to="/app/projekt">
            {ready ? "Edytuj i zobacz podgląd" : "Dokończ opis"}
            <ArrowRight />
          </Link>
          <p className="project-muted">
            Do pracodawcy trafi dopiero, gdy dołączysz go do aplikacji.
          </p>
        </article>
      ) : (
        <div className="project-empty">
          <div className="project-folder">
            <FolderOpen size={44} aria-hidden="true" />
          </div>
          <h2>Jeden przykład mówi więcej.</h2>
          <p>
            Wybierz projekt, w którym możesz pokazać własny wkład. Nie musi być duży ani zakończony
            sukcesem.
          </p>
          <Link className={buttonVariants()} to="/app/projekt">
            <Plus /> Opisz swój projekt
          </Link>
          <p className="project-muted">Możesz zapisać szkic i wrócić później.</p>
        </div>
      )}
      <aside className="project-tip" aria-label="Materiały poufne">
        <strong>Nie możesz pokazać materiałów klienta?</strong>
        <p>
          Opisz sposób pracy i rezultat bez nazw, danych ani poufnych plików. W formularzu
          zaznaczysz, czego nie możesz udostępnić.
        </p>
      </aside>
    </div>
  );
}

export function ProjectEditor() {
  const { state, run, issue, blocked } = usePrototype();
  const person = currentPerson(state)!;
  const [params] = useSearchParams();
  const returnSlug = params.get("oferta");
  const returnJob = state.jobs.find(
    (job) => job.slug === returnSlug && job.publicationStatus === "published",
  );
  const saved = state.projects.find((item) => item.candidateId === person.id)?.value;
  const [project, setProject] = useState<ProjectDraft>(saved ?? { ...emptyProject });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectDraft, string>>>({});
  const [message, setMessage] = useState("");
  const [savedReview, setSavedReview] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function update<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setProject((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
    setMessage("");
    setSavedReview(false);
  }
  function persist() {
    return run({ type: "project", value: project });
  }
  function changeStep(next: number) {
    setStep(next);
    setErrors({});
    setMessage("");
    window.requestAnimationFrame(() => {
      heading.current?.focus();
      window.scrollTo(0, 0);
    });
  }
  function advance() {
    const all = projectErrors(project);
    const relevant =
      step === 2
        ? (Object.keys(all) as (keyof ProjectDraft)[])
        : fieldsByStep[step].filter((key) => all[key]);
    if (relevant.length) {
      const first = relevant[0];
      setErrors(all);
      const targetStep = fieldsByStep.findIndex((keys) => keys.includes(first));
      if (targetStep >= 0 && targetStep !== step) setStep(targetStep);
      window.requestAnimationFrame(() => document.getElementById(`project-${first}`)?.focus());
      return;
    }
    if (persist()) changeStep(step + 1);
  }
  function field(key: keyof ProjectDraft, label: string, hint: string, single = false) {
    const props = {
      id: `project-${key}`,
      value: project[key],
      maxLength: key === "title" ? 160 : key === "role" ? 200 : key === "materialUrl" ? 1000 : 3000,
      "aria-invalid": !!errors[key],
      "aria-describedby": `project-${key}-help`,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        update(key, event.target.value),
    };
    return (
      <div className="project-field">
        <label htmlFor={props.id}>{label}</label>
        {single ? <Input {...props} /> : <Textarea {...props} rows={4} />}
        <p
          id={`project-${key}-help`}
          className={errors[key] ? "project-error" : "project-muted"}
          role={errors[key] ? "alert" : undefined}
        >
          {errors[key] || hint}
        </p>
      </div>
    );
  }
  return (
    <div className="project-page">
      <Link className="project-back" to="/app/projekty">
        <ArrowLeft size={18} /> Moje projekty
      </Link>
      <header className="project-editor-header">
        <div>
          <span className="project-eyebrow">Twój projekt · krok {step + 1} z 4</span>
          <h1>
            Niech Twoja praca
            <br />
            mówi za Ciebie.
          </h1>
        </div>
        <p>
          Od problemu do rezultatu.
          <br />
          Własnymi słowami.
        </p>
      </header>
      <ol className="project-steps" aria-label="Etapy opisu projektu">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <span>{index < step ? <Check size={16} aria-hidden="true" /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="project-editor-layout">
        <section className="project-card">
          <h2 ref={heading} tabIndex={-1}>
            {
              [
                "Od czego się zaczęło?",
                "Co było Twoją pracą?",
                "Pokaż przykład lub opisz ograniczenia.",
                "Tak zobaczy to pracodawca.",
              ][step]
            }
          </h2>
          {step === 0 && (
            <>
              <p className="project-lead">
                Wybierz jeden projekt. Może być zawodowy, własny albo edukacyjny — zaznacz to w
                opisie.
              </p>
              {field(
                "title",
                "Nazwa projektu",
                "Np. Automatyzacja porządkowania zgłoszeń klientów",
                true,
              )}
              {field(
                "problem",
                "Jaki problem rozwiązywał projekt?",
                "Dla kogo powstał? Co wcześniej nie działało? Nie podawaj poufnych danych.",
              )}
              {field(
                "role",
                "Jaka była Twoja rola?",
                "Np. Analiza procesu i przygotowanie prototypu automatyzacji",
                true,
              )}
            </>
          )}
          {step === 1 && (
            <>
              <p className="project-lead">
                Oddziel swoje działania od pracy innych osób. To pomoże zrozumieć zakres Twojego
                doświadczenia.
              </p>
              {field(
                "actions",
                "Co zrobiłeś lub zrobiłaś samodzielnie?",
                "Podaj 2–3 konkretne działania i decyzję, którą podjąłeś lub podjęłaś. Napisz też, w czym pomagało AI.",
              )}
              {field(
                "team",
                "Co zrobili inni?",
                "Opisz wkład zespołu. Przy pracy samodzielnej napisz to wprost.",
              )}
              {field(
                "result",
                "Co z tego wynikło i skąd to wiesz?",
                "Podaj obserwację, pomiar lub informację zwrotną. Jeśli nie znasz wyniku, zaznacz, czego nie zmierzono.",
              )}
            </>
          )}
          {step === 2 && (
            <>
              <p className="project-lead">
                Materiał ma ilustrować konkretny fragment Twojej pracy. Nie musisz udostępniać
                plików klienta.
              </p>
              <fieldset className="project-options">
                <legend>Jak chcesz udokumentować projekt?</legend>
                {(
                  [
                    [
                      "link",
                      "Dodaję link",
                      "Repozytorium, prezentacja lub zanonimizowany przykład.",
                    ],
                    [
                      "private",
                      "Materiał jest poufny",
                      "Opiszę pracę bez udostępniania materiału.",
                    ],
                    [
                      "none",
                      "Nie mam materiału do pokazania",
                      "Wyjaśnię, co można sprawdzić w rozmowie.",
                    ],
                  ] as const
                ).map(([value, label, hint]) => (
                  <label
                    key={value}
                    className={project.materialMode === value ? "is-selected" : ""}
                  >
                    <input
                      type="radio"
                      name="materialMode"
                      checked={project.materialMode === value}
                      onChange={() => {
                        update("materialMode", value);
                        if (value !== "link") update("materialUrl", "");
                      }}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{hint}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {project.materialMode === "link" &&
                field(
                  "materialUrl",
                  "Link do materiału",
                  "Pełny adres https://. Sprawdź, czy odbiorca może go otworzyć.",
                  true,
                )}
              {field(
                "materialDescription",
                project.materialMode === "link"
                  ? "Co pokazuje materiał i czego nie potwierdza?"
                  : "Co możesz opisać bez udostępniania materiału?",
                project.materialMode === "link"
                  ? "Wskaż fragment swojego autorstwa i ograniczenia przykładu."
                  : "Wyjaśnij brak materiału. Opisz konkretną decyzję, sposób działania lub przykład, o którym możesz opowiedzieć.",
              )}
            </>
          )}
          {step === 3 && (
            <>
              <p className="project-lead">
                Sprawdź własny wkład, rezultat i materiały. Zapis nie wysyła projektu do żadnej
                firmy.
              </p>
              <ProjectSummary project={project} />
            </>
          )}
          <div className="project-actions">
            {step > 0 && (
              <Button variant="outline" onClick={() => changeStep(step - 1)}>
                <ArrowLeft /> Wstecz
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={advance}>
                {step === 2 ? (
                  <>
                    <Eye /> Zobacz podgląd
                  </>
                ) : (
                  <>
                    Dalej <ArrowRight />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (persist()) {
                    setSavedReview(true);
                    setMessage(
                      "Opis projektu został zapisany. Możesz dołączyć go do wybranej aplikacji.",
                    );
                  }
                }}
              >
                <Check /> Zapisz projekt
              </Button>
            )}
          </div>
          <div className="project-save">
            <Button
              variant="link"
              onClick={() => {
                if (persist())
                  setMessage("Szkic zapisany. Możesz wrócić do niego w Moich projektach.");
              }}
            >
              Zapisz szkic na później
            </Button>
            <p role="status">
              {message &&
                (issue || blocked
                  ? "Zmiany pozostają w pamięci. Sprawdź komunikat o zapisie u góry strony i wyeksportuj dane przed zamknięciem."
                  : message)}
            </p>
          </div>
          {savedReview && (
            <div className="project-next">
              <strong>Teraz wybierz, komu go pokażesz.</strong>
              <Link
                className={buttonVariants()}
                to={returnJob ? `/aplikuj/${returnJob.slug}` : "/oferty"}
              >
                {returnJob ? "Wróć do aplikacji" : "Przejdź do ofert"}
                <ArrowRight />
              </Link>
            </div>
          )}
        </section>
        <aside className="project-coach" aria-label="Podpowiedź do opisu">
          <span className="project-pill">Mała podpowiedź</span>
          <h2>
            {
              [
                "Konkret zamiast listy narzędzi.",
                "„Zrobiłem” to więcej niż „braliśmy udział”.",
                "Poufne może pozostać poufne.",
                "Ty decydujesz, co udostępniasz.",
              ][step]
            }
          </h2>
          <p>
            {
              [
                "Opisz sytuację, w której trzeba było coś zmienić. Narzędzia są częścią historii, nie jej celem.",
                "Nazwij swoją decyzję i jej powód. Jeśli ktoś inny wdrożył rozwiązanie, zaznacz to.",
                "Brak linku nie przekreśla doświadczenia. Ważne, żeby odbiorca rozumiał, co może sprawdzić, a czego nie.",
                "Pracodawca otrzyma kopię tego opisu dopiero z wybraną aplikacją. Późniejsze zmiany projektu nie zmienią wysłanej kopii.",
              ][step]
            }
          </p>
          <div className="project-note">
            Prototyp do ćwiczenia.
            <br />
            Korzystaj z fikcyjnego przykładu.
          </div>
        </aside>
      </div>
    </div>
  );
}
