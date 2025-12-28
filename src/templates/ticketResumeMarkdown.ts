import { MovideskTicket, TicketInteraction } from "../types/movidesk-ticket.js";

export function formatTicketResumeMarkdown(ticket: MovideskTicket): string {
    const shortDesc = ticket.description.length > 200
        ? ticket.description.substring(0, 200) + "..."
        : ticket.description;

    return `# Ticket Movidesk – ${ticket.id}
## ${ticket.title}

## Informações Gerais
- **Status:** ${ticket.status}
- **Categoria:** ${ticket.category}
- **Urgência:** ${ticket.urgency}
- **Cliente:** ${ticket.client.join(", ")}
- **SLA:** ${ticket.sla}

## Resumo
${shortDesc}

## Estado Atual do Ticket
Status: ${ticket.status}.

## Data dos dados
- Extracted at: ${new Date().toISOString()}
`;
}

function formatInteraction(interaction: TicketInteraction): string {
    const imagesMd = interaction.images && interaction.images.length > 0
        ? "\n" + interaction.images.map(img => `![Anexo](${img})`).join("\n")
        : "";

    return `### ${interaction.date} - ${interaction.author}
${interaction.message}${imagesMd}
`;
}
