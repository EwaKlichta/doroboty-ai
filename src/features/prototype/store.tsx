import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import posthog from "posthog-js";
import { currentPerson, initialState, transition, type Action, type State } from "./model";
import { recordDiagnostic } from "./diagnostics";
import {
  parseState,
  readState,
  saveState,
  serializeState,
  STORAGE_KEY,
  type StoragePort,
} from "./storage";
const OTHER_TAB_MESSAGE =
  "Scenariusz zmienił się w innej karcie. Zapis w tej karcie został wstrzymany, aby nie nadpisać nowszych danych. Wyeksportuj swoją pracę w ustawieniach albo odśwież stronę, aby wczytać nowszy zapis.";
const WRITER_BUSY_MESSAGE =
  "Scenariusz jest otwarty do edycji w innej karcie. Tutaj możesz przeglądać i eksportować dane, ale zapis jest wstrzymany. Zamknij tamtą kartę i odśwież tę stronę, aby przejąć edycję.";
const LOCK_UNAVAILABLE_MESSAGE =
  "Ta przeglądarka nie udostępnia bezpiecznej blokady zapisu. Możesz przeglądać i eksportować dane, ale zmiany nie będą zapisane. Otwórz prototyp przez HTTPS lub w aktualnej przeglądarce.";
function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function useStore() {
  const [loaded] = useState(() => {
    const storage = browserStorage();
    const result = readState(storage);
    let raw: string | null = null;
    try {
      raw = storage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      // readState already exposes unavailable storage to the person.
    }
    return { ...result, raw };
  });
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(loaded.blocked);
  const [ready, setReady] = useState(false);
  const latest = useRef(state);
  const persistedRaw = useRef(loaded.raw);
  const blockedNow = useRef(loaded.blocked);
  const conflictedNow = useRef(false);
  const writerHeld = useRef(false);
  const identifiedPersonId = useRef<string | null>(null);
  const activePerson = currentPerson(state);
  useEffect(() => {
    if (!posthog.__loaded) return;

    const person = activePerson;
    if (!person) {
      if (identifiedPersonId.current !== null) {
        posthog.reset();
        identifiedPersonId.current = null;
      }
      return;
    }

    if (identifiedPersonId.current === person.id) return;
    if (identifiedPersonId.current !== null) posthog.reset();

    posthog.identify(person.id, { name: person.name, role: person.role });
    identifiedPersonId.current = person.id;
  }, [activePerson]);
  function stopWrites(message: string) {
    conflictedNow.current = true;
    blockedNow.current = true;
    setBlocked(true);
    setIssue(message);
  }
  function commit(next: State, replace = false) {
    if (replace && !writerHeld.current) return false;
    latest.current = next;
    setState(next);
    setError("");
    if (!writerHeld.current) return false;
    if (blockedNow.current && !replace) return !conflictedNow.current;
    const storage = browserStorage();
    try {
      if (!replace && storage && storage.getItem(STORAGE_KEY) !== persistedRaw.current) {
        stopWrites(OTHER_TAB_MESSAGE);
        return false;
      }
      saveState(storage, next);
      persistedRaw.current = serializeState(next);
      setIssue("");
      if (replace) {
        blockedNow.current = false;
        conflictedNow.current = false;
        setBlocked(false);
      }
      return true;
    } catch (e) {
      setIssue((e as Error).message);
      recordDiagnostic("storage-write");
      return !replace;
    }
  }
  function run(action: Action) {
    try {
      return commit(transition(latest.current, action));
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }
  function importState(raw: string) {
    try {
      const next = parseState(raw);
      return commit(next, true);
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    let active = true;
    let releaseWriter: (() => void) | null = null;
    function releaseOnPageHide() {
      active = false;
      writerHeld.current = false;
      releaseWriter?.();
    }
    function reloadOnRestore(event: PageTransitionEvent) {
      // A restored document must load fresh state and acquire a new writer lock.
      if (event.persisted) window.location.reload();
    }
    function onStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      if (event.newValue !== persistedRaw.current) stopWrites(OTHER_TAB_MESSAGE);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", releaseOnPageHide);
    window.addEventListener("pageshow", reloadOnRestore);
    queueMicrotask(() => {
      if (!active) return;
      if (!navigator.locks?.request) {
        recordDiagnostic("writer-unavailable");
        stopWrites(LOCK_UNAVAILABLE_MESSAGE);
        setReady(true);
        return;
      }
      void navigator.locks
        .request(STORAGE_KEY, { mode: "exclusive", ifAvailable: true }, async (lock) => {
          if (!active) return;
          if (!lock) {
            stopWrites(WRITER_BUSY_MESSAGE);
            setReady(true);
            return;
          }
          writerHeld.current = true;
          try {
            if (browserStorage()?.getItem(STORAGE_KEY) !== persistedRaw.current)
              stopWrites(OTHER_TAB_MESSAGE);
          } catch {
            // readState already reports unavailable storage.
          }
          setReady(true);
          await new Promise<void>((resolve) => {
            releaseWriter = resolve;
          });
          writerHeld.current = false;
        })
        .catch(() => {
          if (active) {
            recordDiagnostic("writer-unavailable");
            stopWrites(LOCK_UNAVAILABLE_MESSAGE);
            setReady(true);
          }
        });
    });
    return () => {
      releaseOnPageHide();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", releaseOnPageHide);
      window.removeEventListener("pageshow", reloadOnRestore);
    };
  }, []);
  return {
    ready,
    state,
    issue,
    error,
    blocked,
    original: loaded.original,
    run,
    importState,
    clearError: () => setError(""),
    reset: () => commit(initialState(), true),
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  if (!store.ready) return <p role="status">Otwieranie scenariusza…</p>;
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
