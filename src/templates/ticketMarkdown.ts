import { MovideskTicket, TicketInteraction } from "../types/Ticket.js";

export function formatTicketMarkdown(ticket: MovideskTicket): string {
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

## Contexto Técnico Importante
- Extracted at: ${new Date().toISOString()}

## Estado Atual do Ticket
Status: ${ticket.status}.
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
