import { Page, Locator } from "playwright";
import { MovideskTicket, TicketInteraction } from "../types/Ticket.js";

const SELECTORS = {
    title: ".ticket-subject input.subject",
    clientNames: ".client-container .md-select-item .md-select-client-name",
    status: ".ticket-status-container .select2-chosen",
    category: ".category .select2-chosen, #s2id_TicketCategory .select2-chosen",
    urgency: ".urgency .select2-chosen, #s2id_TicketUrgency .select2-chosen",
    sla: ".sla-solution-date span.sla-field-ticket, .sla-timer",
    descriptionFallbacks: ".ticket-description-content, #TicketDescription, .description-content",
    historyItems: ".action-item",
    historyAuthor: ".createdBy",
    historyDate: ".createdDate",
    historyContent: ".action-item-content",
    historyImages: ".action-item-content img",
    elementsToRemove: ".message-show-more, .show-more, .action-item-menu, .action-item-number"
};

export async function scrapeTicket(page: Page, ticketIdOrUrl: string, baseUrl: string): Promise<MovideskTicket> {

    const url = resolveTicketUrl(ticketIdOrUrl, baseUrl);
    
    console.error(`Navigating to ticket: ${url}`);
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    const id = extractTicketId(url);
    const metadata = await extractMetadata(page);
    const history = await extractHistory(page);
    const description = await extractDescription(page, history);

    return {
        id,
        ...metadata,
        description,
        history,
        lastUpdate: new Date().toISOString(),
    };
}

function resolveTicketUrl(ticketIdOrUrl: string, baseUrl: string): string {
    return ticketIdOrUrl.startsWith("http")
        ? ticketIdOrUrl
        : `${baseUrl}/Ticket/Edit/${ticketIdOrUrl}`;
}

function extractTicketId(url: string): string {
    const match = url.match(/\/Ticket\/Edit\/(\d+)/);
    return match ? match[1] : "Unknown";
}

async function extractMetadata(page: Page) {
    const [title, client, status, category, urgency, sla] = await Promise.all([
        page.locator(SELECTORS.title).getAttribute("value").catch(() => "Título não encontrado"),
        page.locator(SELECTORS.clientNames).allInnerTexts().catch(() => ["Cliente não encontrado"]),
        getText(page, SELECTORS.status, "Status não encontrado"),
        getText(page, SELECTORS.category, "Categoria não encontrada"),
        getText(page, SELECTORS.urgency, "Urgência não encontrada"),
        getText(page, SELECTORS.sla, "N/A"),
    ]);

    return { title: title ?? "Título não encontrado", client, status, category, urgency, sla };
}

async function extractDescription(page: Page, history: TicketInteraction[]): Promise<string> {
    let description = "";

    const frame = page.frames().find(f => f.name().includes("TicketDescription") || f.url().includes("htmlEditor"));
    if (frame) {
        description = await frame.innerText("body").catch(() => "");
    }

    if (!description.trim()) {
        description = await getText(page, SELECTORS.descriptionFallbacks, "");
    }

    if (!description.trim() && history.length > 0) {
        description = history[history.length - 1].message;
    }

    return description.trim() || "Descrição não encontrada";
}

async function extractHistory(page: Page): Promise<TicketInteraction[]> {
    const history: TicketInteraction[] = [];
    const items = page.locator(SELECTORS.historyItems);
    const count = await items.count();

    for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const interaction = await scrapeInteraction(item);
        if (interaction) history.push(interaction);
    }

    return history;
}

async function scrapeInteraction(item: Locator): Promise<TicketInteraction | null> {
    const author = await item.locator(SELECTORS.historyAuthor).innerText().catch(() => "Desconhecido");
    const date = await item.locator(SELECTORS.historyDate).innerText().catch(() => "");
    
    const message = await item.locator(SELECTORS.historyContent).evaluate((el, selectors) => {
        const clone = el.cloneNode(true) as HTMLElement;
        
        clone.querySelectorAll(selectors.elementsToRemove).forEach(e => e.remove());

        const cleanElement = (elements: NodeListOf<Element>, threshold: number) => {
            elements.forEach(el => {
                const text = el.textContent?.trim().toLowerCase() || "";
                if ((text.startsWith("atenciosamente") || text.includes("este e-mail e seus anexos")) && 
                    (el as HTMLElement).innerText.length < threshold) {
                    el.remove();
                }
            });
        };

        cleanElement(clone.querySelectorAll("div:not([class])"), 1500);
        cleanElement(clone.querySelectorAll("p, span"), 500);

        return clone.innerText.trim() || clone.textContent?.trim() || "";
    }, SELECTORS).catch(() => "");

    const images = await item.locator(SELECTORS.historyImages).evaluateAll((imgs: HTMLImageElement[]) => 
        imgs.map(img => img.src || img.getAttribute("data-src") || "")
            .filter(src => src && !src.includes("default-avatar.png"))
    ).catch(() => []);

    if (!message.trim() && images.length === 0) return null;

    return {
        date: date.trim(),
        author: author.trim(),
        message: message.trim(),
        images: images as string[]
    };
}

async function getText(page: Page, selector: string, defaultValue: string): Promise<string> {
    try {
        return await page.locator(selector).first().innerText({ timeout: 2000 });
    } catch {
        return defaultValue;
    }
}
