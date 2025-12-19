export interface MovideskTicket {
    id: string;
    title: string;
    status: string;
    priority: string;
    client: string;
    requester: string;
    sla: string;
    description: string;
    history: TicketInteraction[];
    lastUpdate: string;
}

export interface TicketInteraction {
    date: string;
    author: string;
    message: string;
}
