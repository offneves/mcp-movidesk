import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTicketContext } from "./tools/getTicketContext.js";
import { z } from "zod";

const server = new McpServer({
    name: "mcp-movidesk",
    version: "1.0.0",
});

server.tool(
    "get_movidesk_ticket_context",
    {
        ticketId: z.string().optional().describe("Ticket ID"),
        ticketUrl: z.string().optional().describe("Ticket URL"),
    },
    async (args) => {
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
        } catch (error) {
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
    }
);

server.tool(
    "validate_movidesk_login",
    {
        username: z.string().optional().describe("Movidesk Username"),
        password: z.string().optional().describe("Movidesk Password"),
        baseUrl: z.string().optional().describe("Movidesk Base URL"),
    },
    async (args) => {
        const { validateLogin } = await import("./tools/validateLogin.js");
        
        const baseUrl = args.baseUrl || process.env.MOVIDESK_BASE_URL;
        const username = args.username || process.env.MOVIDESK_USERNAME;
        const password = args.password || process.env.MOVIDESK_PASSWORD;

        if (!baseUrl || !username || !password) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: Missing credentials. Please provide them as arguments or set environment variables (MOVIDESK_BASE_URL, MOVIDESK_USERNAME, MOVIDESK_PASSWORD).",
                    },
                ],
                isError: true,
            };
        }

        const result = await validateLogin({ baseUrl, username, password });

        return {
            content: [
                {
                    type: "text",
                    text: result.message,
                },
            ],
            isError: !result.success,
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Movidesk MCP Server running on stdio");
