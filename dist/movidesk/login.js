export async function login(session, credentials) {
    const context = await session.init();
    const page = await context.newPage();
    const { baseUrl, username, password } = credentials;
    try {
        console.error(`Navigating to ${baseUrl}`);
        await page.goto(baseUrl);
        // Initial check: if we are redirected to /Account/Login, we need to log in.
        if (page.url().includes("/Account/Login") || (await page.$("input#username"))) {
            console.error("Not logged in. Performing login...");
            // Wait for the username input to be available
            await page.waitForSelector("input#username", { timeout: 10000 });
            await page.fill("input#username", username);
            await page.fill("input#password", password);
            console.error("Credentials filled. Submitting...");
            await Promise.all([
                page.waitForNavigation(),
                page.click("button[type='submit']"), // Adjust selector if needed
            ]);
            console.error("Login submitted.");
            await session.saveState();
        }
        else {
            console.error("Likely already logged in.");
        }
        return page;
    }
    catch (error) {
        console.error("Login process failed:", error);
        throw error;
    }
}
