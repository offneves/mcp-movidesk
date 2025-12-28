export const SELECTORS = {
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
