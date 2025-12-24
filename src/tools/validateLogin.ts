import { MovideskSession } from "../movidesk/session.js";
import { login } from "../movidesk/login.js";
import { LoginCredentials } from "../types/Login.js";

export async function validateLogin(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {

    const session = new MovideskSession();
    
    try {
        await session.init(true);
        const page = await login(session, credentials);
        const url = page.url();

        if (!url.includes("Account/Login")) {
            return { success: true, message: "Login successful. Credentials are valid." };
        } else {
            return { success: false, message: "Login failed: Still on login page after submission." };
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Login validation failed: ${errorMessage}` };
    } finally {
        await session.close();
    }
}
