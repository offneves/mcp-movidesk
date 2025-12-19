import { chromium } from "playwright";
import fs from "fs";
import path from "path";
const STORAGE_STATE_PATH = path.join(process.cwd(), "playwright", "storageState.json");
export class MovideskSession {
    browser = null;
    context = null;
    async init() {
        if (this.context) {
            return this.context;
        }
        this.browser = await chromium.launch({
            headless: true,
        });
        if (fs.existsSync(STORAGE_STATE_PATH)) {
            try {
                this.context = await this.browser.newContext({
                    storageState: STORAGE_STATE_PATH,
                });
                console.error("Loaded existing session from storageState.json");
            }
            catch (e) {
                console.error("Failed to load storage state, creating new context", e);
                this.context = await this.browser.newContext();
            }
        }
        else {
            this.context = await this.browser.newContext();
        }
        return this.context;
    }
    async saveState() {
        if (this.context) {
            // Ensure directory exists
            const dir = path.dirname(STORAGE_STATE_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await this.context.storageState({ path: STORAGE_STATE_PATH });
            console.error("Session saved to storageState.json");
        }
    }
    async close() {
        if (this.context) {
            await this.context.close();
            this.context = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
