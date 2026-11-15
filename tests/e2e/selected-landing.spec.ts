import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing filters survive audience changes, reload and recovery; offers open the application flow", async ({
  page,
}) => {
  await page.goto("/#/");
  await page.getByLabel("Co chcesz robić?").fill("Product");
  await page.getByRole("button", { name: "Szukaj ofert", exact: true }).click();
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 3");
  await page.getByRole("button", { name: "Szukam pracowników", exact: true }).click();
  await expect(page.locator("#candidate-path")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Znajdź ludzi");
  await page.getByRole("button", { name: "Szukam pracy", exact: true }).click();
  await expect(page.getByLabel("Co chcesz robić?")).toHaveValue("Product");
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 3");
  await page
    .getByRole("group", { name: "Kategorie ofert" })
    .getByRole("button", { name: "Prowadzę projekty" })
    .click();
  await page.reload();
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 2");
  await page.getByLabel("Co chcesz robić?").fill("nieistniejaca-rola-xyz");
  await page.getByRole("button", { name: "Szukaj ofert", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nie ma tu jeszcze takiej oferty." }),
  ).toBeVisible();
  await page.locator(".landing-empty").getByRole("button", { name: "Wyczyść filtry" }).click();
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 6");
  await expect(page.getByLabel("Co chcesz robić?")).toHaveValue("");
  await page.getByLabel("Gdzie chcesz pracować?").selectOption("remote");
  await page.getByRole("button", { name: "Szukaj ofert", exact: true }).click();
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 2");
  await page.getByRole("button", { name: "Wyczyść filtry ↺", exact: true }).click();
  await page.getByRole("button", { name: "Pokaż więcej ofert ↓" }).click();
  await expect(page.locator(".landing-jobs .pp-job-card")).toHaveCount(6);
  await page.getByRole("link", { name: "AI Product Manager", exact: true }).click();
  await page.getByRole("link", { name: "Wybierz osobę i aplikuj", exact: true }).click();
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await expect(page.getByLabel("Dlaczego pasujesz do tej roli?")).toBeVisible();
});

test("publication dialog restores focus and routes through employer selection into a working local editor", async ({
  page,
}) => {
  await page.goto("/#/?audience=employer");
  const trigger = page.getByRole("button", { name: /Poznaj tę opcję.*Pakiet publikacji/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Pakiet publikacji" });
  await expect(dialog).toContainText("bez zakupu pakietu");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: "Przygotuj ogłoszenie" }).click();
  await expect(page.getByRole("button", { name: /Wejdź jako Anna/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await expect(page).toHaveURL(/#\/app\/oferty\/nowa$/);
  await page.getByLabel("Nazwa stanowiska").fill("Oferta z nowego landingu");
  await page
    .getByLabel("Krótkie podsumowanie")
    .fill("Przykładowa rola do sprawdzenia lokalnej publikacji.");
  await page
    .getByLabel("Opis oferty", { exact: true })
    .fill("Przykładowe zadania: badania użytkowników, prototypowanie i weryfikacja automatyzacji.");
  await page.getByRole("checkbox", { name: "Zatwierdzam treść oferty" }).check();
  await page.getByRole("button", { name: "Opublikuj ofertę" }).click();
  await page.goto("/#/");
  await page.getByLabel("Co chcesz robić?").fill("Oferta z nowego landingu");
  await page.getByRole("button", { name: "Szukaj ofert", exact: true }).click();
  await expect(page.locator(".landing-count")).toHaveText("Wyniki: 1");
  await expect(
    page.getByRole("link", { name: "Oferta z nowego landingu", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Oferta z nowego landingu", exact: true }),
  ).toBeVisible();
});

test("selected direction loads local fonts and reflows both audiences without external requests", async ({
  page,
}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (!/^(http:\/\/127\.0\.0\.1:3106|data:|blob:)/.test(request.url()))
      external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const audience of ["candidate", "employer"]) {
      await page.goto(`/#/?audience=${audience}`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.fonts.check('750 40px "Fraunces"'))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('400 16px "DM Sans"'))).toBe(true);
      await expect(page.locator("h1")).toHaveCSS("font-family", /Fraunces/);
      await expect(page.locator("body")).toHaveCSS("font-family", /DM Sans/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const label = await page.locator(".landing-scene-label").boundingBox();
      const art = await page.locator(".landing-scene img").boundingBox();
      expect(label!.y + label!.height).toBeLessThan(art!.y);
      await page.screenshot({
        path: `artifacts/selected-landing/${audience}-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile public menu, FAQ, section navigation and accessibility", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/");
  const menu = page.getByRole("button", { name: "Otwórz menu" });
  await menu.click();
  await page
    .getByRole("navigation", { name: "Główna nawigacja" })
    .getByRole("link", { name: "Jak to działa" })
    .click();
  await expect(page.locator("#jak")).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Główna nawigacja" })).toBeHidden();
  await page.locator("summary").filter({ hasText: "Czy muszę umieć programować?" }).click();
  await expect(page.locator("details[open]")).toContainText("Sprawdź wymagania konkretnej oferty.");
  await menu.click();
  await page
    .getByRole("navigation", { name: "Główna nawigacja" })
    .getByRole("link", { name: "Oferty pracy" })
    .focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  for (const audience of ["candidate", "employer"]) {
    await page.goto(`/#/?audience=${audience}`);
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(scan.violations).toEqual([]);
  }
});
