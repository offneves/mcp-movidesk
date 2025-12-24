import { MovideskSession } from "../movidesk/session.js";
import { login } from "../movidesk/login.js";
import { GetTicketContextArgs } from "../types/GetTicketContext.js";
import { scrapeTicket } from "../movidesk/ticketScraper.js";
import { formatTicketMarkdown } from "../templates/ticketMarkdown.js";

export async function getTicketContext(args: GetTicketContextArgs): Promise<string> {

    const session = new MovideskSession();
    
    try {
        const page = await login(session, {
            baseUrl: args.baseUrl,
            username: args.username,
            password: args.password,
        });

        const ticketTarget = args.ticketUrl || args.ticketId;
        if (!ticketTarget) {
            throw new Error("Missing ticketId or ticketUrl");
        }

        const ticket = await scrapeTicket(page, ticketTarget, args.baseUrl);
        const markdown = formatTicketMarkdown(ticket);

        return markdown;
    } catch (error) {
        console.error("Error in getTicketContext:", error);
        throw error;
    } finally {
        await session.close();
    }
}
