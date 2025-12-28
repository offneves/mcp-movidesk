import { MovideskTicket, TicketInteraction } from "../types/movidesk-ticket.js";

export function formatTicketContextMarkdown(ticket: MovideskTicket): string {
    const shortDesc = ticket.description.length > 200
        ? ticket.description.substring(0, 200) + "..."
        : ticket.description;

    return `# Ticket Movidesk – ${ticket.id}
## ${ticket.title}

## Resumo Executivo
${shortDesc}

## Informações Gerais
- **Status:** ${ticket.status}
- **Categoria:** ${ticket.category}
- **Urgência:** ${ticket.urgency}
- **Cliente:** ${ticket.client.join(", ")}
- **SLA:** ${ticket.sla}

## Descrição Original
${ticket.description}

## Histórico de Interações
${ticket.history.length > 0 ? ticket.history.map(formatInteraction).join("\n") : "_Nenhuma interação registrada._"}

## Status atual do ticket
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
