import { Page } from "playwright";
import { MovideskSession } from "./session.js";

interface LoginCredentials {
    baseUrl: string;
    username: string;
    password: string;
}

export async function login(session: MovideskSession, credentials: LoginCredentials): Promise<Page> {
    const context = await session.init();
    const page = await context.newPage();

    const { baseUrl, username, password } = credentials;

    try {
        console.error(`Navigating to ${baseUrl}`);
        await page.goto(baseUrl);

        if (page.url().includes("/Account/Login") || (await page.$("input#username"))) {
            console.error("Not logged in. Performing login...");

            await page.waitForSelector("input#username", { timeout: 10000 });
            await page.fill("input#username", username);
            await page.fill("input#password", password);

            console.error("Credentials filled. Submitting...");

            await Promise.all([
                page.waitForNavigation(),
                page.click("button[type='submit']"),
            ]);

            console.error("Login submitted.");
            await session.saveState();
        } else {
            console.error("Likely already logged in.");
        }

        return page;
    } catch (error) {
        console.error("Login process failed:", error);
        throw error;
    }
}
