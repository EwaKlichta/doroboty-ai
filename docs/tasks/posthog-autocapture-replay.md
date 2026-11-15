# PostHog: Autocapture i nagrywanie sesji

## Zakres

- Autocapture zapisuje kliknięcia przycisków na publicznych trasach: strona główna, oferty, strony firm, metodologia i prywatność. Nie obejmuje formularzy, panelu konta ani działań innych niż kliknięcie przycisku.
- Nagrywanie sesji jest włączone w przeglądarkowym SDK. SDK maskuje treść pól, cały tekst i atrybuty elementów oraz blokuje obrazy, ramki, wideo, płótna i pliki. Nie zapisuje konsoli, nagłówków ani treści żądań.
- Filtr `before_send` usuwa dodatkowe właściwości zdarzeń Autocapture, w tym odsyłacz i parametry URL. Własny znacznik przycisku „Szukam pracowników” pozwala rozpoznać go w zdarzeniach.
- W projekcie PostHog 351745 Autocapture jest dozwolone (`autocapture_opt_out=false`), nagrywanie sesji włączone (`session_recording_opt_in=true`); wyłączono zbieranie konsoli i danych wydajnościowych.

## Sprawdzenie

- Kliknięcie „Szukam pracowników” w zwykłej przeglądarce lokalnej aplikacji dotarło do PostHoga jako `$autocapture`, z etykietą przycisku i URL bez parametrów.
- W projekcie pojawiło się nagranie sesji testowej: `01a1e13d-3de5-74ea-b194-e2fce5819388`.
- Testowy napis `TEST_PRIVATE_MARKER_7842` wpisany w pole wyszukiwania nie pojawił się w właściwościach żadnego zdarzenia `$autocapture` w sprawdzanym okresie (zapytanie SQL zwróciło 0).
- Test jednostkowy filtra zdarzeń, typy i lint przeszły. Maskowanie nagrania opiera się na konfiguracji SDK; zawartości klatek nagrania nie odczytywano z API.

## Wdrożenie

Zmiany kodu wymagają scalenia PR i wdrożenia z gałęzi `main`. Ustawienia projektu PostHog są już zapisane. Po wdrożeniu sprawdzić zdarzenie z domeny produkcyjnej i nową sesję w [PostHog Replay](https://eu.posthog.com/project/351745/replay).
