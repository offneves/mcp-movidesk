import { chromium, Browser, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const STORAGE_STATE_PATH = path.join(process.cwd(), "playwright", "storageState.json");

export class MovideskSession {
    
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;

    async init(ignoreState: boolean = false): Promise<BrowserContext> {
        if (this.context) return this.context;

        this.browser = await chromium.launch({ headless: true });

        const hasStoredState = fs.existsSync(STORAGE_STATE_PATH);
        const shouldLoadState = !ignoreState && hasStoredState;

        try {
            this.context = await this.browser.newContext(
                shouldLoadState ? { storageState: STORAGE_STATE_PATH } : {}
            );
            
            if (shouldLoadState) {
                console.error("Loaded existing session from storageState.json");
            } else {
                console.error(ignoreState ? "Clean session for validation" : "No existing session found");
            }
        } catch (e) {
            console.error("Failed to load storage state, falling back to new context", e);
            this.context = await this.browser.newContext();
        }

        return this.context;
    }

    async saveState(): Promise<void> {
        if (!this.context) return;

        const dir = path.dirname(STORAGE_STATE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        await this.context.storageState({ path: STORAGE_STATE_PATH });
        console.error("Session state saved successfully.");
    }

    async close(): Promise<void> {
        await this.context?.close();
        await this.browser?.close();
        this.context = null;
        this.browser = null;
    }
}
