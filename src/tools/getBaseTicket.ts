import { login } from "../movidesk/login.js";
import { MovideskSession } from "../movidesk/session.js";
import { scrapeTicket } from "../movidesk/ticketScraper.js";
import { GetTicketContextArgs } from "../types/get-ticket-context.js";
import { MovideskTicket } from "../types/movidesk-ticket.js";

/**
 * Common logic to fetch ticket data and format it using a provided template.
 * @param args The credentials and ticket identifiers.
 * @param formatter A function that takes a MovideskTicket and returns a formatted string (Markdown).
 * @returns The formatted ticket content.
 */
export async function fetchAndFormatTicket(
    args: GetTicketContextArgs, 
    formatter: (ticket: MovideskTicket) => string
): Promise<string> {
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
        return formatter(ticket);
    } catch (error) {
        console.error("Error in fetchAndFormatTicket:", error);
        throw error;
    } finally {
        await session.close();
    }
}
