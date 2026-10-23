import { test, expect } from "@playwright/test";

test.describe("Login", () => {

  test("TC1.1: should login an user when you try to login with a valid mail and password", async ({
    page,
  }) => {

    const mail = "tibo@mail.com";
    const password = "Password123!";

    await page.goto("http://localhost:5173/");
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL("http://localhost:5173/login");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("alert").filter({ hasText: "Connexion réussie" })).toBeVisible();
  });

  test("TC1.2: should give an error when you try to login with a bad password", async ({
    page,
  }) => {

    const mail = "tibo@mail.com";
    const password = "Password123456!";

    await page.goto("http://localhost:5173/");
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL("http://localhost:5173/login");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Adresse mail ou mot de passe incorrect" })).toBeVisible();
  });

   test("TC1.3: should give an error when you try to login with a bad mail", async ({
    page,
  }) => {

    const mail = "inexistant@mail.com";
    const password = "Password123!";

    await page.goto("http://localhost:5173/");
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL("http://localhost:5173/login");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.locator("form").getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Adresse mail ou mot de passe incorrect" })).toBeVisible();
  });

});