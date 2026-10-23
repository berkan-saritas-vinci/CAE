import { test, expect } from "@playwright/test";

test.describe("Register", () => {

  test("TC1.1: should register a new user when valid username & password for the first step", async ({
    page,
  }) => {

    const mail = "test@mail.com";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

        await expect(page.getByText(`Bienvenue ${tag}`)).toBeVisible();
  });

    test("TC1.2: should register a new user when valid username & password and create a valid team", async ({
    page,
  }) => {

    const mail = "test2@mail.com";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Bienvenue ${tag}`)).toBeVisible();

    const teamName = "TEAM_HOTEL"

    await page.getByRole("button", { name: "Créer une équipe"}).click();
    await page.getByRole("textbox", { name: ""}).fill(teamName);
    await page.getByRole("button", { name: "Créer l'équipe"}).click();

      await expect(page.getByText("Équipe créée ! Redirection...")).toBeVisible();
  });


    test("TC1.3: should register a new user when valid username & password and ask to join a team", async ({
    page,
  }) => {

    const mail = "test3@mail.com";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Bienvenue ${tag}`)).toBeVisible();
    await page.getByRole("button", { name: "Rejoindre une équipe"}).click();

    await page.locator(".MuiCard-root")
      .filter({ hasText: "TEAM_ALPHA" })
      .getByRole("button", { name: "Envoyer une demande d'adhésion" })
      .click();
    
  });



  test("TC1.4: should give an error with the mail when we try to register (The @mail.com is missing)", async ({
    page,
  }) => {

    const badMail1 = "test";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(badMail1);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrez une adresse email valide`)).toBeVisible();
  });

  
  test("TC1.5: should give an error with the mail when we try to register (The word before the @ and .com is missing)", async ({
    page,
  }) => {

    const badMail2 = "@mail";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(badMail2);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrez une adresse email valide`)).toBeVisible();
  });

  test("TC1.6: should give an error with the mail when we try to register (The word before the @ is missing)", async ({
    page,
  }) => {

    const badMail3 = "@mail.com";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(badMail3);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrez une adresse email valide`)).toBeVisible();
  });

  test("TC1.7: should give an error with the password when we try to register (We need to have 8 caracters)", async ({
    page,
  }) => {

    const mail = "test@mail.com";
    const badPassword1 = "Pas123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(badPassword1);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrer un mot de passe contenant : au moins 8 caractères, un chiffre et un caractère spécial.`)).toBeVisible();
  });

  test("TC1.8: should give an error with the password when we try to register (We need to have one number minimum)", async ({
    page,
  }) => {

    const mail = "test@mail.com";
    const badPassword2 = "Password!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(badPassword2);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrer un mot de passe contenant : au moins 8 caractères, un chiffre et un caractère spécial.`)).toBeVisible();
  });

  test("TC1.9: should give an error with the password when we try to register (We need to have a special caracter)", async ({
    page,
  }) => {

    const mail = "test@mail.com";
    const badPassword3 = "Password123";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(badPassword3);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page.getByText(`Veuillez entrer un mot de passe contenant : au moins 8 caractères, un chiffre et un caractère spécial.`)).toBeVisible();
  });

  test("TC1.10: should give an error with the mail and tell that is empty when we click on the next step", async ({
    page,
  }) => {

    const emptyMail = "";
    const password = "Password123!";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(emptyMail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    // permet de voir si un champ est vide ou pas
    const mailValidationMessage = await page
  .getByRole("textbox", { name: "Adresse mail" })
  .evaluate((el) => (el as HTMLInputElement).validationMessage);
  
  await expect(mailValidationMessage.length).toBeGreaterThan(0);
  });

   test("TC1.11: should give an error with the password and tell that is empty when we click on the next step", async ({
    page,
  }) => {

    const mail = "test11@mail.com";
    const password = "";
    const tag = "tagTest";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    // permet de voir si un champ est vide ou pas
    const passwordValidationMessage = await page
  .getByRole("textbox", { name: "Mot de passe" })
  .evaluate((el) => (el as HTMLInputElement).validationMessage);
  
  await expect(passwordValidationMessage.length).toBeGreaterThan(0);
  });

  test("TC1.12: should give an error with the tag and tell that is empty when we click on the next step", async ({
    page,
  }) => {

    const mail = "test12@mail.com";
    const password = "Password123!";
    const tag = "";
    const speciality = "Architecte";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    // permet de voir si un champ est vide ou pas
    const tagValidationMessage = await page
  .getByRole("textbox", { name: "Tag" })
  .evaluate((el) => (el as HTMLInputElement).validationMessage);
  
  await expect(tagValidationMessage.length).toBeGreaterThan(0);
  });

  

  test("TC1.13: should give an error with the speciality and tell that is empty when we click on the next step", async ({
    page,
  }) => {

    const mail = "test13@mail.com";
    const password = "Password123!";
    const tag = "TestTag";
    const imagePath = "/src/assets/avatars/avatar1.jpg";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.getByRole("button", { name: "Choisir un avatar"}).click();
    await page.locator(`img[src="${imagePath}"]`).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

    await expect(page).toHaveURL("http://localhost:5173/register");
  });

    test("TC1.14: should give an error with the picture when it is empty and we click on the next step", async ({
    page,
  }) => {

    const mail = "test14@mail.com";
    const password = "Password123!";
    const tag = "TestTag";
    const speciality = "Tacticien";

    await page.goto("http://localhost:5173/");

    await page.getByText("S'inscrire").click();

    await expect(page).toHaveURL("http://localhost:5173/register");

    await page.getByRole("textbox", { name: "Adresse mail"}).fill(mail);
    await page.getByRole("textbox", { name: "Mot de passe"}).fill(password);
    await page.getByRole("textbox", { name: "Tag"}).fill(tag);
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: speciality }).click();
    await page.getByRole("button", { name: "Étape suivante"}).click();

      await expect(page.getByText("Erreur lors de l'inscription")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:5173/register");
  });

});