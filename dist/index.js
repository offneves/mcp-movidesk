import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getTicketContext } from "./tools/getTicketContext.js";
const server = new McpServer({
    name: "movidesk-mcp-server",
    version: "1.0.0",
});
server.tool("get_movidesk_ticket_context", {
    ticketId: z.string().optional().describe("Ticket ID"),
    ticketUrl: z.string().optional().describe("Ticket URL"),
}, async (args) => {
    // Read credentials from environment variables
    const baseUrl = process.env.MOVIDESK_BASE_URL;
    const username = process.env.MOVIDESK_USERNAME;
    const password = process.env.MOVIDESK_PASSWORD;
    if (!baseUrl || !username || !password) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: Configuration missing. MOVIDESK_BASE_URL, MOVIDESK_USERNAME, and MOVIDESK_PASSWORD must be set in the MCP server environment.",
                },
            ],
            isError: true,
        };
    }
    if (!args.ticketId && !args.ticketUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: Either ticketId or ticketUrl must be provided.",
                },
            ],
            isError: true,
        };
    }
    try {
        const result = await getTicketContext({
            ...args,
            baseUrl,
            username,
            password,
        });
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting ticket context: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Movidesk MCP Server running on stdio");
