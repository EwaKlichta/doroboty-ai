import { useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { currentPerson } from "@/features/prototype/model";
import { usePrototype } from "@/features/prototype/store";

export function PublicHeader() {
  const { state } = usePrototype();
  const person = currentPerson(state);
  const location = useLocation();
  const route = location.pathname + location.search;
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === route;
  const trigger = useRef<HTMLButtonElement>(null);
  const employer = new URLSearchParams(location.search).get("audience") === "employer";
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link to="/" className="public-wordmark" aria-label="DoRoboty.ai — strona główna">
          <BrandMark />
          <span>
            doroboty<span className="brand-ai">.ai</span>
          </span>
        </Link>
        <button
          ref={trigger}
          type="button"
          className="public-menu"
          aria-expanded={open}
          aria-controls="public-nav"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpenAt(open ? null : route)}
        >
          Menu {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav
          id="public-nav"
          className={open ? "public-nav is-open" : "public-nav"}
          aria-label="Główna nawigacja"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpenAt(null);
              trigger.current?.focus();
            }
          }}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpenAt(null);
          }}
        >
          <Link to="/oferty">Oferty pracy</Link>
          <Link
            to={
              employer && location.pathname === "/"
                ? "/?audience=employer&section=how"
                : "/?section=how"
            }
          >
            Jak to działa
          </Link>
          {person?.role === "candidate" && (
            <>
              <Link to="/app/aplikacje">Aplikacje</Link>
              <Link to="/app/profil">Profil</Link>
            </>
          )}
          {person ? (
            <>
              <Link className="public-account" to="/app">
                Moje konto
              </Link>
              <Link className="public-change-person" to="/auth/sign-in">
                Zmień osobę
              </Link>
            </>
          ) : (
            <Link
              className="public-account"
              to={`/auth/sign-in?audience=${employer ? "employer" : "candidate"}`}
            >
              Wybierz osobę
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-top">
          <Link className="public-wordmark" to="/">
            <BrandMark />
            <span>
              doroboty<span className="brand-ai">.ai</span>
            </span>
          </Link>
          <p>Technologia zmienia pracę. Ty wybierasz kierunek.</p>
        </div>
        <nav aria-label="Stopka">
          <Link to="/oferty">Oferty pracy</Link>
          <Link to="/metodologia">Metodologia</Link>
          <Link to="/polityka-prywatnosci">Prywatność</Link>
          <Link to="/auth/sign-in">Strefa case</Link>
        </nav>
        <p className="public-demo-note">
          Prototyp · fikcyjny case AIPH 3 · dane demonstracyjne, bez aktywnej rekrutacji.
        </p>
      </div>
    </footer>
  );
}
