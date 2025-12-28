import { GetTicketContextArgs } from "../types/get-ticket-context.js";
import { fetchAndFormatTicket } from "./getBaseTicket.js";
import { formatTicketResumeMarkdown } from "../templates/ticketResumeMarkdown.js";

export async function getTicketResume(args: GetTicketContextArgs): Promise<string> {
    return fetchAndFormatTicket(args, formatTicketResumeMarkdown);
}