export function formatTicketMarkdown(ticket) {
    const shortDesc = ticket.description.length > 200
        ? ticket.description.substring(0, 200) + "..."
        : ticket.description;
    return `# 🎫 Ticket Movidesk – ${ticket.id}

## 🧾 Resumo Executivo
${shortDesc}

## 🏷️ Informações Gerais
- **Status:** ${ticket.status}
- **Prioridade:** ${ticket.priority}
- **Cliente:** ${ticket.client}
- **Solicitante:** ${ticket.requester}
- **SLA:** ${ticket.sla}

## 📝 Descrição Original
${ticket.description}

## 💬 Histórico de Interações
${ticket.history.length > 0 ? ticket.history.map(formatInteraction).join("\n") : "_Nenhuma interação registrada._"}

## 🧠 Contexto Técnico Importante
- Extracted at: ${new Date().toISOString()}

## 🔍 Estado Atual do Ticket
Status: ${ticket.status}.
`;
}
function formatInteraction(interaction) {
    return `### ${interaction.date} - ${interaction.author}
${interaction.message}
`;
}
