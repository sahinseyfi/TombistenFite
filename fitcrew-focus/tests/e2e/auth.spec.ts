import { expect, test } from "@playwright/test";

test.describe("Auth flows", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Tekrar hoş geldiniz/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Giriş yap/i })).toBeVisible();
  });

  test("register page shows validation errors when passwords differ", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Ad Soyad").fill("Test Kullanıcı");
    await page.getByLabel("Kullanıcı Adı").fill("@testkullanici");
    await page.getByLabel("E-posta").fill("test@example.com");
    await page.getByLabel("Telefon (opsiyonel)").fill("+905551112233");
    await page.getByLabel("Şifre").fill("Secret123!");
    await page.getByLabel("Şifre (Tekrar)").fill("Secret456!");
    await page.getByRole("button", { name: /Kayıt ol/i }).click();
    await expect(page.getByText(/Şifreler eşleşmiyor/i)).toBeVisible();
  });
});
