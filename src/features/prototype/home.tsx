import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowDown, ArrowUpRight, Code2, Flag, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JobCard } from "@/features/jobs/job-card";
import { filterJobs, parseJobFilters } from "@/features/jobs/filters";
import { usePrototype } from "./store";
import { currentPerson, publishedJobs } from "./model";
import peopleArt from "../../assets/selected/people.svg";

const categories = [
  {
    slug: "build",
    english: "Build",
    label: "Tworzę AI",
    description: "Buduję modele, piszę kod i łączę technologię w działające rozwiązania.",
    Icon: Code2,
  },
  {
    slug: "apply",
    english: "Apply",
    label: "Korzystam z AI",
    description: "Automatyzuję zadania i wykorzystuję AI w swojej codziennej pracy.",
    Icon: Sparkles,
  },
  {
    slug: "lead",
    english: "Lead",
    label: "Prowadzę projekty",
    description: "Łączę ludzi, wyznaczam kierunek i prowadzę inicjatywy związane z AI.",
    Icon: Flag,
  },
] as const;
const plans = [
  {
    title: "Jedno ogłoszenie",
    short: "Publikacja na 30 dni.",
    description:
      "Gdy szukasz osoby na konkretną rolę. W tej opcji ogłoszenie jest publikowane przez 30 dni.",
  },
  {
    title: "Pakiet publikacji",
    short: "Gdy planujesz więcej rekrutacji.",
    description:
      "Gdy masz kilka rekrutacji w planie. Korzystasz z ogłoszeń w ramach kupionego pakietu.",
  },
  {
    title: "No Limit",
    short: "Dostęp na ustalony okres.",
    description:
      "Gdy rekrutacja jest stałą częścią pracy Twojego zespołu. Wybierasz dostęp na ustalony okres.",
  },
];
function goToSection(id: string) {
  const target = document.getElementById(id);
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: "start" });
}
export default function HomePage() {
  const { state } = usePrototype();
  const person = currentPerson(state);
  const [params, setParams] = useSearchParams();
  const employer = params.get("audience") === "employer";
  const section = params.get("section");
  const filters = parseJobFilters(Object.fromEntries(params));
  const [expanded, setExpanded] = useState(false);
  const jobs = filterJobs(publishedJobs(state), filters);
  const editor =
    person?.role === "employer"
      ? "/app/oferty/nowa"
      : "/auth/sign-in?audience=employer&next=%2Fapp%2Foferty%2Fnowa";
  const listingParams = new URLSearchParams(params);
  listingParams.delete("audience");
  listingParams.delete("section");
  useEffect(() => {
    if (section !== "how") return;
    const frame = requestAnimationFrame(() => goToSection(employer ? "employer-how" : "jak"));
    return () => cancelAnimationFrame(frame);
  }, [section, employer]);
  function changeAudience(next: "candidate" | "employer") {
    const updated = new URLSearchParams(params);
    updated.delete("section");
    if (next === "employer") updated.set("audience", next);
    else updated.delete("audience");
    setParams(updated, { replace: true });
  }
  function applyFilters(update: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params);
    next.delete("section");
    update(next);
    setExpanded(false);
    setParams(next);
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    applyFilters((next) => {
      const query = String(data.get("query") ?? "").trim();
      const location = String(data.get("location") ?? "");
      next.delete("query");
      next.delete("location");
      next.delete("remote");
      if (query) next.set("query", query);
      if (location === "remote") next.set("remote", "remote");
      else if (location) next.set("location", location);
    });
    goToSection("oferty");
  }
  function chooseCategory(category?: string) {
    applyFilters((next) => {
      if (category) next.set("category", category);
      else next.delete("category");
    });
  }
  function reset() {
    applyFilters((next) => {
      ["query", "location", "remote", "category"].forEach((key) => next.delete(key));
    });
    goToSection("oferty");
  }
  return (
    <div className="landing" data-audience={employer ? "employer" : "candidate"}>
      <div className="landing-wrap">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-audience" role="group" aria-label="Wybierz cel wizyty">
              <button
                type="button"
                aria-pressed={!employer}
                aria-controls="candidate-path employer-path"
                onClick={() => changeAudience("candidate")}
              >
                Szukam pracy
              </button>
              <button
                type="button"
                aria-pressed={employer}
                aria-controls="candidate-path employer-path"
                onClick={() => changeAudience("employer")}
              >
                Szukam pracowników
              </button>
            </div>
            <p className="sr-only" role="status">
              {employer ? "Wybrano ścieżkę dla pracodawców." : "Wybrano ścieżkę dla kandydatów."}
            </p>
            <div className="landing-eyebrow">
              <span className="landing-dot" />
              {employer ? "AI potrzebuje Twojego zespołu." : "Praca z AI. Po Twojemu."}
            </div>
            <h1>
              {employer ? (
                <>
                  Znajdź ludzi,
                  <br />z którymi
                  <br />
                  <em>ruszysz dalej.</em>
                </>
              ) : (
                <>
                  Znajdź swoje
                  <br />
                  miejsce w<br />
                  <em>świecie AI.</em>
                </>
              )}
            </h1>
            <p>
              {employer
                ? "Szukasz osób, które tworzą AI, wykorzystują je w praktyce lub prowadzą projekty? Pokaż im swoją ofertę pracy."
                : "Tworzysz technologię, korzystasz z AI czy prowadzisz projekty? Tu zaczyna się Twój kolejny krok."}
            </p>
            <div className="landing-actions">
              <Button
                className="landing-primary"
                onClick={() => goToSection(employer ? "publikacje" : "oferty")}
              >
                {employer ? "Wybierz publikację" : "Znajdź pracę"}
                <ArrowUpRight aria-hidden="true" />
              </Button>
              <button
                className="landing-text-link"
                onClick={() => goToSection(employer ? "employer-how" : "sciezki")}
              >
                {employer ? "Jak to działa" : "Odkryj swoją ścieżkę"}
                <ArrowDown size={16} aria-hidden="true" />
              </button>
            </div>
            <small>
              {employer
                ? "Jedno ogłoszenie, pakiet publikacji lub No Limit."
                : "Przeglądaj oferty bez zakładania konta."}
            </small>
            <div className="landing-demo-note">
              To prototyp do ćwiczeń. Używaj tylko fikcyjnych danych. Wybór osoby nie chroni
              informacji: role korzystają ze wspólnego zapisu w tej przeglądarce.
            </div>
          </div>
          <div className="landing-scene">
            <span className="landing-scene-label">
              {employer ? "Twój zespół. Wspólny kierunek." : "Różne talenty. Wspólny kierunek."}
            </span>
            <img
              src={peopleArt}
              width="620"
              height="520"
              alt="Dwie osoby współpracują przy laptopie — jedna tworzy, druga dzieli się pomysłem."
            />
          </div>
        </section>
      </div>
      <div id="candidate-path" hidden={employer}>
        <div className="landing-wrap">
          <form
            className="landing-search"
            onSubmit={search}
            key={`${filters.query ?? ""}:${filters.location ?? ""}:${filters.remote ?? ""}`}
          >
            <div>
              <label htmlFor="home-query">Co chcesz robić?</label>
              <input
                id="home-query"
                name="query"
                type="search"
                maxLength={100}
                placeholder="Stanowisko lub słowo kluczowe"
                defaultValue={filters.query ?? ""}
              />
            </div>
            <div>
              <label htmlFor="home-location">Gdzie chcesz pracować?</label>
              <select
                id="home-location"
                name="location"
                defaultValue={filters.remote === "remote" ? "remote" : (filters.location ?? "")}
              >
                <option value="">Dowolna lokalizacja</option>
                <option value="remote">Zdalnie</option>
                <option>Warszawa</option>
                <option>Wrocław</option>
                <option>Kraków</option>
                <option>Polska</option>
              </select>
            </div>
            <Button type="submit" className="landing-primary">
              Szukaj ofert
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </form>
          <section className="landing-section" id="sciezki" tabIndex={-1}>
            <div className="landing-section-head">
              <div>
                <h2>
                  AI ma wiele twarzy.
                  <br />
                  Praca z nim też.
                </h2>
                <p>Wybierz to, co jest Ci najbliższe. Możesz zmienić zdanie.</p>
              </div>
            </div>
            <div className="landing-categories">
              {categories.map(({ slug, label, english, description, Icon }) => (
                <button
                  key={slug}
                  className="landing-category"
                  aria-pressed={filters.category === slug}
                  onClick={() => {
                    chooseCategory(slug);
                    goToSection("oferty");
                  }}
                >
                  <span className="landing-category-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="landing-english">{english}</span>
                  <span className="landing-category-title">{label}</span>
                  <span className="landing-category-description">{description}</span>
                  <span className="landing-category-bottom">
                    {filters.category === slug ? "✓ Wybrano" : "Odkryj oferty"}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
        <section className="landing-offers" id="oferty" tabIndex={-1}>
          <div className="landing-wrap">
            <div className="landing-section-head">
              <div>
                <div className="landing-eyebrow">Twój kolejny krok</div>
                <h2>Sprawdź, gdzie możesz działać.</h2>
                <p>Ogłoszenia w prototypie — dane demonstracyjne.</p>
              </div>
              <button className="landing-text-link" onClick={reset}>
                Wyczyść filtry ↺
              </button>
            </div>
            <div className="landing-filters" role="group" aria-label="Kategorie ofert">
              <button aria-pressed={!filters.category} onClick={() => chooseCategory()}>
                Wszystkie
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  aria-pressed={filters.category === category.slug}
                  onClick={() => chooseCategory(category.slug)}
                >
                  {category.label}
                </button>
              ))}
              <span className="landing-count" role="status">
                Wyniki: {jobs.length}
              </span>
            </div>
            <div className="pp-job-list landing-jobs">
              {jobs.slice(0, expanded ? jobs.length : 3).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={
                    person?.role === "candidate"
                      ? state.saved.some(
                          (entry) => entry.candidateId === person.id && entry.jobId === job.id,
                        )
                      : undefined
                  }
                />
              ))}
              {!jobs.length && (
                <div className="landing-empty">
                  <h3>Nie ma tu jeszcze takiej oferty.</h3>
                  <p>Spróbuj innego hasła lub usuń filtry, aby zobaczyć dostępne role.</p>
                  <Button variant="outline" onClick={reset}>
                    Wyczyść filtry
                  </Button>
                </div>
              )}
            </div>
            <div className="landing-actions landing-more">
              {jobs.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setExpanded(!expanded);
                    if (expanded) goToSection("oferty");
                  }}
                >
                  {expanded ? "Pokaż mniej ofert ↑" : "Pokaż więcej ofert ↓"}
                </Button>
              )}
              <Link className="landing-text-link" to={`/oferty?${listingParams}`}>
                Pełna lista i filtry
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        <div className="landing-wrap">
          <section className="landing-section" id="jak" tabIndex={-1}>
            <div className="landing-eyebrow">Od ciekawości do aplikacji</div>
            <h2>
              Nowy rozdział?
              <br />
              Zacznij od prostego kroku.
            </h2>
            <div className="landing-steps">
              <div>
                <span>01 / ODKRYJ</span>
                <h3>Znajdź coś dla siebie</h3>
                <p>
                  Przeglądaj role z różnych obszarów AI. Sprawdź zadania, wymagania i sposób pracy.
                </p>
              </div>
              <div>
                <span>02 / POKAŻ SIĘ</span>
                <h3>Opowiedz, co potrafisz</h3>
                <p>
                  Wybierz profil kandydata i uzupełnij umiejętności oraz doświadczenie. Korzystanie
                  z profilu jest bezpłatne.
                </p>
                <Link
                  to="/auth/sign-in?audience=candidate&next=%2Fapp%2Fprofil"
                  className="landing-text-link"
                >
                  Przejdź do profilu ↗
                </Link>
              </div>
              <div>
                <span>03 / ZRÓB KROK</span>
                <h3>Aplikuj po swojemu</h3>
                <p>
                  Wybierz ofertę, napisz własną odpowiedź i zatwierdź zgłoszenie. Jego dalszy status
                  sprawdzisz w swoim panelu.
                </p>
              </div>
            </div>
          </section>
          <section className="landing-employer-callout">
            <div>
              <div className="landing-eyebrow">Dla pracodawców</div>
              <h2>
                Za technologią
                <br />
                stoją ludzie.
                <br />
                Znajdź swoich.
              </h2>
              <p>
                Szukasz osób, które budują AI, wykorzystują je w praktyce lub prowadzą projekty?
                Zacznij od swojej oferty.
              </p>
              <Button
                className="landing-primary"
                onClick={() => {
                  changeAudience("employer");
                  window.scrollTo({ top: 0 });
                }}
              >
                Poznaj opcje publikacji
                <ArrowUpRight aria-hidden="true" />
              </Button>
            </div>
            <div>
              {plans.map((plan, index) => (
                <div className="landing-plan-summary" key={plan.title}>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{plan.title}</strong>
                    <small>{plan.short}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="landing-faq">
            <h2>
              Warto wiedzieć,
              <br />
              zanim zaczniesz.
            </h2>
            <div>
              <details>
                <summary>Czy muszę umieć programować?</summary>
                <p>
                  To zależy od roli. Poza tworzeniem technologii znajdziesz tu pracę z
                  wykorzystaniem narzędzi AI i prowadzenie projektów. Sprawdź wymagania konkretnej
                  oferty.
                </p>
              </details>
              <details>
                <summary>Czy profil kandydata jest bezpłatny?</summary>
                <p>
                  Tak. W tym prototypie wybierasz przygotowaną osobę, uzupełniasz profil i
                  aplikujesz bez zakładania konta ani płatności.
                </p>
              </details>
              <details>
                <summary>Co oznaczają Build, Apply i Lead?</summary>
                <p>
                  Build to budowanie rozwiązań AI. Apply oznacza wykorzystywanie AI w pracy i
                  procesach. Lead to prowadzenie inicjatyw, ustalanie priorytetów i współpraca
                  zespołów.
                </p>
              </details>
              <details>
                <summary>Jak działa aplikowanie i Match Score?</summary>
                <p>
                  Odpowiedź piszesz samodzielnie i zatwierdzasz przed wysłaniem. Match Score jest
                  przygotowanym wynikiem scenariusza; nie ocenia Twoich umiejętności ani szansy
                  zatrudnienia.
                </p>
              </details>
            </div>
          </section>
        </div>
      </div>
      <section
        className="landing-wrap landing-employer-path"
        id="employer-path"
        hidden={!employer}
        aria-label="Oferta dla pracodawców"
      >
        <div className="landing-section-head" id="publikacje" tabIndex={-1}>
          <div>
            <div className="landing-eyebrow">Publikuj na swoich zasadach</div>
            <h2>Jedna rola czy cały zespół?</h2>
            <p>Poznaj opcje publikacji i przygotuj ogłoszenie w prototypie.</p>
          </div>
        </div>
        <div className="landing-publications">
          {plans.map((plan, index) => (
            <article key={plan.title} className="landing-publication">
              <span className="landing-plan-number">0{index + 1}</span>
              <h3>{plan.title}</h3>
              <p>{plan.description}</p>
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  Poznaj tę opcję
                  <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only">: {plan.title}</span>
                </DialogTrigger>
                <DialogContent className="landing-plan-dialog">
                  <DialogTitle>{plan.title}</DialogTitle>
                  <DialogDescription>{plan.description}</DialogDescription>
                  <p>
                    To opis koncepcyjnej opcji. W prototypie przygotujesz i opublikujesz ogłoszenie
                    lokalnie, bez zakupu pakietu i naliczania opłat. Okresy oraz limity pakietów nie
                    są egzekwowane.
                  </p>
                  <Link to={editor} className={buttonVariants()}>
                    Przygotuj ogłoszenie
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </DialogContent>
              </Dialog>
            </article>
          ))}
        </div>
        <p className="landing-employer-note">
          Opcje koncepcyjne. Publikacja działa lokalnie w prototypie; ceny i zakup pakietów nie są
          dostępne.
        </p>
        <section className="landing-section" id="employer-how" tabIndex={-1}>
          <div className="landing-eyebrow">Od potrzeby do ogłoszenia</div>
          <h2>
            Pokaż, kogo potrzebuje
            <br />
            Twój zespół.
          </h2>
          <div className="landing-steps">
            <div>
              <span>01 / OPISZ ROLĘ</span>
              <h3>Zacznij od zadań</h3>
              <p>
                Przedstaw zakres pracy, umiejętności i warunki. W edytorze możesz skorzystać z
                przygotowanej propozycji opisu, a potem ją poprawić.
              </p>
            </div>
            <div>
              <span>02 / OPUBLIKUJ</span>
              <h3>Daj się znaleźć</h3>
              <p>
                Sprawdź i zatwierdź treść. Ogłoszenie pojawi się na liście ofert w Twoim lokalnym
                scenariuszu.
              </p>
            </div>
            <div>
              <span>03 / POZNAJ KANDYDATÓW</span>
              <h3>Przejdź do zgłoszeń</h3>
              <p>
                Przeglądaj aplikacje, zapisuj zaproszenia na rozmowy i kolejne decyzje rekrutacyjne
                w panelu pracodawcy.
              </p>
            </div>
          </div>
          <div className="landing-actions">
            <Link className={buttonVariants()} to={editor}>
              Przygotuj ogłoszenie
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
