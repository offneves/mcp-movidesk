import { GetTicketContextArgs } from "../types/get-ticket-context.js";
import { fetchAndFormatTicket } from "./getBaseTicket.js";
import { formatTicketContextMarkdown } from "../templates/ticketContextMarkdown.js";

export async function getTicketContext(args: GetTicketContextArgs): Promise<string> {
    return fetchAndFormatTicket(args, formatTicketContextMarkdown);
}
