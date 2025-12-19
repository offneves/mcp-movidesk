import { Page } from "playwright";
import { MovideskTicket, TicketInteraction } from "../types/Ticket.js";

export async function scrapeTicket(page: Page, ticketIdOrUrl: string, baseUrl: string): Promise<MovideskTicket> {
    const url = ticketIdOrUrl.startsWith("http")
        ? ticketIdOrUrl
        : `${baseUrl}/Ticket/Edit/${ticketIdOrUrl}`;

    console.error(`Navigating to ticket: ${url}`);
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    const idMatch = url.match(/\/Ticket\/Edit\/(\d+)/);
    const id = idMatch ? idMatch[1] : "Unknown";

    const getValue = async (selector: string, defaultValue: string = "N/A") => {
        try {
            if (selector.includes("option")) {
                return await page.locator(selector).innerText({ timeout: 2000 });
            } else {
                return await page.locator(selector).inputValue({ timeout: 2000 });
            }
        } catch {
            return defaultValue;
        }
    };

    const getText = async (selector: string, defaultValue: string = "N/A") => {
        try {
            return await page.locator(selector).innerText({ timeout: 2000 });
        } catch {
            return defaultValue;
        }
    };

    const title = await getValue("#TicketTitle", "Título não encontrado");
    const status = await getText("#TicketStatus option:checked", "Status não encontrado");
    const priority = await getText("#TicketPriority option:checked", "Prioridade não encontrada");
    const client = await getValue("#TicketClient", "Cliente não encontrado");
    const requester = await getValue("#TicketRequester", "Solicitante não encontrado");
    const sla = await getText(".sla-timer", "N/A");

    const description = await getText("#TicketDescription", "Descrição não encontrada");

    const history: TicketInteraction[] = [];
    const historyItems = page.locator(".ticket-action");
    const count = await historyItems.count();

    for (let i = 0; i < count; i++) {
        const item = historyItems.nth(i);
        const date = await item.locator(".action-date").innerText().catch(() => "");
        const author = await item.locator(".action-author").innerText().catch(() => "");
        const message = await item.locator(".action-message").innerText().catch(() => "");

        if (message.trim()) {
            history.push({ date, author, message });
        }
    }

    return {
        id,
        title,
        status,
        priority,
        client,
        requester,
        sla,
        description,
        history,
        lastUpdate: new Date().toISOString(),
    };
}
