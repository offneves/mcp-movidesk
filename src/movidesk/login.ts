import { Page } from "playwright";
import { MovideskSession } from "./session.js";
import { LoginCredentials } from "../types/Login.js";

const SELECTORS = {
    username: ".username-input-login-service",
    password: ".password-input-login-service",
    submit: "#btnSubmit",
    errorAlert: ".alert-login-error-text",
    successMarkers: ["#main-container", ".navbar"],
    sessionModalSim: "text=SIM"
};

export async function login(session: MovideskSession, credentials: LoginCredentials): Promise<Page> {

    const context = await session.init();
    const page = await context.newPage();
    const { baseUrl, username, password } = credentials;

    try {
        console.error(`Navigating to ${baseUrl}`);
        await page.goto(baseUrl, { timeout: 60000, waitUntil: "domcontentloaded" });

        const needsLogin = page.url().includes("/Account/Login") || (await page.$(SELECTORS.username));
        
        if (needsLogin) {
            console.error("Not logged in. Performing login...");
            await page.waitForSelector(SELECTORS.username, { timeout: 15000 });
            await page.fill(SELECTORS.username, username);
            await page.fill(SELECTORS.password, password);
            
            console.error("Credentials filled. Submitting...");
            await page.click(SELECTORS.submit);

            const success = await waitForLoginCompletion(page);
            if (!success) {
                throw new Error("Login timed out or failed to reach dashboard.");
            }

            console.error("Login successful.");
            await page.waitForLoadState("networkidle").catch(() => {});
            await session.saveState();
        } else {
            console.error("Likely already logged in. Current URL:", page.url());
        }

        return page;
    } catch (error) {
        console.error("Login process failed:", error);
        throw error;
    }
}

async function waitForLoginCompletion(page: Page): Promise<boolean> {
    
    const startTime = Date.now();
    const TIMEOUT = 60000;

    while (Date.now() - startTime < TIMEOUT) {
        const currentUrl = page.url();
        
        if (!currentUrl.includes("Account/Login") && !currentUrl.includes("Account/LogOff")) return true;
        if (await page.$(SELECTORS.successMarkers.join(", "))) return true;

        const simButton = await page.$(SELECTORS.sessionModalSim);
        if (simButton && await simButton.isVisible()) {
            console.error("Detected existing session modal. Clicking SIM...");
            await simButton.click().catch(() => {});
            await page.waitForTimeout(2000);
            await page.click(SELECTORS.submit).catch(() => {});
        }

        const errorAlert = await page.$(SELECTORS.errorAlert);
        if (errorAlert && await errorAlert.isVisible()) {
            const errorText = await errorAlert.innerText().catch(() => "Unknown error");
            throw new Error(`Login failed: ${errorText}`);
        }

        await page.waitForTimeout(2000);
    }
    
    return false;
}
