export async function scrapeTicket(page, ticketIdOrUrl, baseUrl) {
    // Construct the full URL if only an ID is provided
    const url = ticketIdOrUrl.startsWith("http")
        ? ticketIdOrUrl
        : `${baseUrl}/Ticket/Edit/${ticketIdOrUrl}`;
    console.error(`Navigating to ticket: ${url}`);
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    // Attempt to extract ID from URL
    const idMatch = url.match(/\/Ticket\/Edit\/(\d+)/);
    const id = idMatch ? idMatch[1] : "Unknown";
    // Selectors - these are hypothetical and based on typical Movidesk DOM structures.
    // They should be updated based on real inspection.
    const getValue = async (selector, defaultValue = "N/A") => {
        try {
            if (selector.includes("option")) {
                return await page.locator(selector).innerText({ timeout: 2000 });
            }
            else {
                return await page.locator(selector).inputValue({ timeout: 2000 });
            }
        }
        catch {
            return defaultValue;
        }
    };
    const getText = async (selector, defaultValue = "N/A") => {
        try {
            return await page.locator(selector).innerText({ timeout: 2000 });
        }
        catch {
            return defaultValue;
        }
    };
    const title = await getValue("#TicketTitle", "Título não encontrado");
    const status = await getText("#TicketStatus option:checked", "Status não encontrado");
    const priority = await getText("#TicketPriority option:checked", "Prioridade não encontrada");
    const client = await getValue("#TicketClient", "Cliente não encontrado");
    const requester = await getValue("#TicketRequester", "Solicitante não encontrado");
    const sla = await getText(".sla-timer", "N/A");
    // Description often lives in a specific container
    const description = await getText("#TicketDescription", "Descrição não encontrada");
    // History scraping
    const history = [];
    const historyItems = page.locator(".ticket-action"); // Hypothetical class for interactions
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
