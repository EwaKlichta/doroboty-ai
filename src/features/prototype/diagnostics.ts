const KEY = "doroboty.diagnostics.v1";
const CODES = [
  "storage-write",
  "writer-unavailable",
  "runtime-error",
  "unhandled-rejection",
  "render-error",
] as const;
type Code = (typeof CODES)[number];
type Entry = { code: Code; at: string };
const LIMIT = 50;

export function diagnosticEntries(): Entry[] {
  try {
    const values: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(values)) return [];
    return values
      .flatMap((value) => {
        if (!value || typeof value !== "object") return [];
        const { code, at } = value as Record<string, unknown>;
        if (
          !CODES.includes(code as Code) ||
          typeof at !== "string" ||
          !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(at)
        )
          return [];
        return [{ code: code as Code, at }];
      })
      .slice(-LIMIT);
  } catch {
    return [];
  }
}

export function recordDiagnostic(code: Code) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify(
        [...diagnosticEntries(), { code, at: new Date().toISOString() }].slice(-LIMIT),
      ),
    );
  } catch {
    // Diagnostics must never interrupt the exercise when browser storage is denied.
  }
}

export function downloadDiagnostics() {
  const contents = JSON.stringify({ format: 1, events: diagnosticEntries() }, null, 2);
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "doroboty-diagnostyka.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function installDiagnosticHandlers() {
  window.addEventListener("error", () => recordDiagnostic("runtime-error"));
  window.addEventListener("unhandledrejection", () => recordDiagnostic("unhandled-rejection"));
}
