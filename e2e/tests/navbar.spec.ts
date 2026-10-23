import { test, expect } from "@playwright/test";

test.describe("Navbar", () => {

    test("TC1.1: sould stay on the home page when we click on the 'Accueil' in the navbar", async ({
        page,
    }) => {

        await page.goto("http://localhost:5173/");

        await page.getByText("Accueil").click();
        
        await expect(page).toHaveURL("http://localhost:5173/");
    });


    test("TC1.2: sould go on url 'http://localhost:5173/users'  when we click on the 'Recherches' in the navbar", async ({
        page,
    }) => {

        await page.goto("http://localhost:5173/");

        await page.getByText("Recherches").click();
        
        await expect(page).toHaveURL("http://localhost:5173/users");
    });

        test("TC1.3: sould go on url 'http://localhost:5173/register'  when we click on the 'S'inscrire' in the navbar", async ({
        page,
    }) => {

        await page.goto("http://localhost:5173/");

        await page.getByText("S'inscrire").click();
        
        await expect(page).toHaveURL("http://localhost:5173/register");
    });

            test("TC1.4: sould go on url 'http://localhost:5173/login'  when we click on the 'Se connecter' in the navbar", async ({
        page,
    }) => {

        await page.goto("http://localhost:5173/");

        await page.getByText("Se connecter").click();
        
        await expect(page).toHaveURL("http://localhost:5173/login");
    });
})