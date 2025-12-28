import { LoginCredentials } from "./movidesk-login.js";

export interface GetTicketContextArgs extends LoginCredentials {
    ticketId?: string;
    ticketUrl?: string;
}
