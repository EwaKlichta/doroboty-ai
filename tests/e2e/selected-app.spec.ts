import { expect, test, type Page } from "@playwright/test";

async function checkScreen(page: Page, path: string, screenshot?: string) {
  await page.goto(`/#/${path}`);
  await expect(page.locator("main h1").first()).toBeVisible();
  const layout = await page.evaluate(async () => {
    await document.fonts.ready;
    const heading = document.querySelector("main h1")!;
    return {
      headingFont: getComputedStyle(heading).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
      frauncesReady: document.fonts.check('750 32px "Fraunces"'),
      dmSansReady: document.fonts.check('400 16px "DM Sans"'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  expect(layout.headingFont).toContain(path.startsWith("oferty/") ? "DM Sans" : "Fraunces");
  expect(layout.bodyFont).toContain("DM Sans");
  expect(layout.frauncesReady).toBe(true);
  expect(layout.dmSansReady).toBe(true);
  expect(layout.overflow, `${path}: horizontal overflow`).toBeLessThanOrEqual(1);
  if (screenshot) {
    await page.screenshot({ path: `artifacts/selected-app/${screenshot}.png`, fullPage: true });
  }
}

for (const width of [1440, 390, 320]) {
  test(`selected style covers public, candidate and employer screens at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await checkScreen(page, "oferty", `listing-${width}`);
    await expect(page.getByText("Korzystam z AI").first()).toBeVisible();
    await checkScreen(page, "oferty/ai-product-manager", `offer-${width}`);
    await checkScreen(page, "firmy/brightlabs");
    await checkScreen(page, "metodologia");
    await checkScreen(page, "polityka-prywatnosci");

    await page.goto("/#/auth/sign-in?audience=candidate");
    await page.getByRole("button", { name: "Wejdź jako Anna Kowalska" }).click();
    await checkScreen(page, "aplikuj/ai-product-manager", `apply-${width}`);
    await checkScreen(page, "app", `candidate-${width}`);
    await checkScreen(page, "app/profil", `profile-${width}`);
    await checkScreen(page, "app/profil/podglad");
    await checkScreen(page, "app/zapisane");
    await checkScreen(page, "app/aplikacje");
    await checkScreen(page, "app/settings");

    await page.goto("/#/auth/sign-in?audience=employer");
    await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska" }).click();
    await checkScreen(page, "app", `employer-${width}`);
    await checkScreen(page, "app/oferty");
    await checkScreen(page, "app/oferty/nowa", `editor-${width}`);
    await checkScreen(page, "app/organizacja");
    await checkScreen(page, "app/kandydaci");
    await checkScreen(page, "app/kandydaci/application-example", `record-${width}`);
    await checkScreen(page, "app/settings");

    await page.goto("/#/auth/sign-in");
    await page.getByRole("button", { name: "Wejdź jako Prowadzący" }).click();
    await checkScreen(page, "app/case");
  });
}

test("long Polish job title, location and absent salary grow the mobile card", async ({ page }) => {
  const title = "Specjalista / specjalistka ds. automatyzacji procesów obsługi klienta z AI";
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/#/auth/sign-in?audience=employer");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska" }).click();
  await page.goto("/#/app/oferty/nowa");
  await page.getByLabel("Nazwa stanowiska").fill(title);
  await page.getByLabel("Krótkie podsumowanie").fill("Praca nad automatyzacją obsługi klienta.");
  await page
    .getByLabel("Opis oferty", { exact: true })
    .fill("Przykładowa rola w fikcyjnym scenariuszu. Usprawnianie procesów obsługi klienta z AI.");
  await page
    .getByLabel("Lokalizacja", { exact: true })
    .fill("Warszawa / Kraków / Gdańsk / praca hybrydowa");
  await page.getByRole("checkbox", { name: "Zatwierdzam treść oferty" }).check();
  await page.getByRole("button", { name: "Opublikuj ofertę" }).click();
  await page.goto("/#/oferty");
  const card = page.locator(".pp-job-card", { hasText: title });
  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: title })).toBeVisible();
  await expect(card).toContainText("Wynagrodzenie: nie podano");
  await expect(card).toContainText("Warszawa / Kraków / Gdańsk");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/selected-app/stress-mobile.png", fullPage: true });
});
