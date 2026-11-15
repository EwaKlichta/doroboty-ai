import { Component, type ReactNode } from "react";
import { downloadDiagnostics, recordDiagnostic } from "./diagnostics";

export class DiagnosticBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    recordDiagnostic("render-error");
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="prototype-panel prototype-form m-6">
        <h1>Nie udało się wyświetlić strony</h1>
        <p>
          Nie resetuj scenariusza. Pobierz diagnostykę i zgłoś problem Ewie kanałem, którym
          otrzymałaś lub otrzymałeś link do ćwiczenia.
        </p>
        <button type="button" onClick={downloadDiagnostics}>
          Pobierz diagnostykę
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </button>
      </main>
    );
  }
}
