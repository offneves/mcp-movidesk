import { LoginCredentials } from "./Login.js";

export interface GetTicketContextArgs extends LoginCredentials {
    ticketId?: string;
    ticketUrl?: string;
}
