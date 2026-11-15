import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function choose(page: Page, name: string) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: `Wejdź jako ${name}`, exact: true }).click();
}
async function createProject(page: Page) {
  await choose(page, "Anna Kowalska");
  await page.goto("/#/app/projekty");
  await page.getByRole("link", { name: "Opisz swój projekt" }).click();
  await page.getByRole("button", { name: "Dalej", exact: true }).click();
  await expect(page.getByLabel("Nazwa projektu", { exact: true })).toBeFocused();
  await page
    .getByLabel("Nazwa projektu", { exact: true })
    .fill("Automatyzacja porządkowania zgłoszeń klientów — przykład demonstracyjny");
  await page
    .getByLabel("Jaki problem rozwiązywał projekt?")
    .fill("Ręczne sortowanie zgłoszeń zajmowało dużo czasu.");
  await page.getByLabel("Jaka była Twoja rola?").fill("Analiza procesu i prototyp reguł");
  await page.getByRole("button", { name: "Zapisz szkic na później" }).click();
  await page.reload();
  await expect(page.getByLabel("Jaka była Twoja rola?")).toHaveValue(
    "Analiza procesu i prototyp reguł",
  );
  await page.screenshot({ path: "artifacts/project-editor-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Dalej", exact: true }).click();
  await page
    .getByLabel("Co zrobiłeś lub zrobiłaś samodzielnie?")
    .fill(
      "Przeanalizowałam 30 zgłoszeń i zaprojektowałam cztery reguły. AI pomogło nazwać kategorie.",
    );
  await page
    .getByLabel("Co zrobili inni?")
    .fill("Programista podłączył rozwiązanie do systemu. Koleżanka przygotowała dane testowe.");
  await page
    .getByLabel("Co z tego wynikło i skąd to wiesz?")
    .fill("24 z 30 przypisań zgodne z ręczną oceną. Nie zmierzono czasu w produkcji.");
  await page.screenshot({ path: "artifacts/project-contribution-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Dalej", exact: true }).click();
  await page.getByLabel("Link do materiału", { exact: true }).fill("javascript:alert(1)");
  await page
    .getByLabel("Co pokazuje materiał i czego nie potwierdza?")
    .fill("Fragment mojej pracy.");
  await page.getByRole("button", { name: "Zobacz podgląd" }).click();
  await expect(page.getByLabel("Link do materiału", { exact: true })).toBeFocused();
  await page.getByRole("radio", { name: /Materiał jest poufny/ }).check();
  await page
    .getByLabel("Co możesz opisać bez udostępniania materiału?")
    .fill("Dane klienta są poufne. Mogę wyjaśnić cztery reguły na fikcyjnym przykładzie.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/project-material-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Zobacz podgląd" }).click();
  await expect(page.getByText("Tak zobaczy to pracodawca.", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/project-preview-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Zapisz projekt", exact: true }).click();
}

test("candidate prepares, controls sharing, employer reads immutable project snapshot", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createProject(page);
  await page.goto("/#/aplikuj/ai-product-manager");
  await page
    .getByLabel("Dlaczego pasujesz do tej roli?")
    .fill("Projektowałam reguły kategoryzacji zgłoszeń i sprawdziłam je na próbce.");
  const attachment = page.getByRole("checkbox", { name: /Dołącz projekt/ });
  await expect(attachment).not.toBeChecked();
  await attachment.check();
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page.reload();
  await expect(attachment).toBeChecked();
  await page.screenshot({ path: "artifacts/project-attachment-desktop.png", fullPage: true });
  await page.getByRole("checkbox", { name: "Zatwierdzam treść i przesłanie aplikacji" }).check();
  await page.getByRole("button", { name: "Wyślij aplikację", exact: true }).click();
  await page.getByRole("link", { name: "AI Product Manager", exact: true }).click();
  const applicationId = page.url().split("/").pop();
  await expect(page.getByRole("tab", { name: "Projekt", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.screenshot({ path: "artifacts/project-sent-desktop.png", fullPage: true });
  await page.goto("/#/app/projekt");
  await page.getByLabel("Nazwa projektu", { exact: true }).fill("Zmieniony później tytuł");
  await page.getByRole("button", { name: "Zapisz szkic na później" }).click();
  await choose(page, "Karolina Wiśniewska");
  await page.goto(`/#/app/kandydaci/${applicationId}`);
  await expect(page.getByRole("heading", { name: /Automatyzacja porządkowania/ })).toBeVisible();
  await expect(page.getByText("Zmieniony później tytuł")).toHaveCount(0);
  await expect(page.getByText("Materiał poufny", { exact: true })).toBeVisible();
  await expect(page.getByText(/Nie zostały niezależnie zweryfikowane/)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "artifacts/project-employer-desktop.png", fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const tab = await page.getByRole("tab", { name: "CV", exact: true }).boundingBox();
    const sheet = await page.locator(".record-sheet").boundingBox();
    expect(tab!.x + tab!.width).toBeLessThanOrEqual(sheet!.x + sheet!.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.screenshot({ path: "artifacts/project-employer-mobile.png", fullPage: true });
  await choose(page, "Tomasz Zieliński");
  await page.goto(`/#/app/kandydaci/${applicationId}`);
  await expect(page.getByRole("heading", { name: /Automatyzacja porządkowania/ })).toHaveCount(0);
  await choose(page, "Marek Nowak");
  await page.goto("/#/app/projekty");
  await expect(page.getByText("Jeden przykład mówi więcej.", { exact: true })).toBeVisible();
});

test("empty state, editor keyboard access, fonts and narrow layout", async ({ page }) => {
  await choose(page, "Anna Kowalska");
  await page.goto("/#/app/projekty");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "artifacts/project-start-desktop.png", fullPage: true });
  const start = page.getByRole("link", { name: "Opisz swój projekt" });
  await start.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Nazwa projektu", { exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () =>
        document.fonts.check('750 40px "Fraunces"') && document.fonts.check('400 16px "DM Sans"'),
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.screenshot({ path: "artifacts/project-editor-mobile.png", fullPage: true });
});
