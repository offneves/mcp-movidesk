export interface MovideskTicket {
    id: string;
    title: string;
    client: string[];
    status: string,
    category: string,
    urgency: string,
    sla: string;
    description: string;
    history: TicketInteraction[];
    lastUpdate: string;
}

export interface TicketInteraction {
    date: string;
    author: string;
    message: string;
    images?: string[];
}
