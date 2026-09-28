import fs from "fs/promises";
import { Ticket } from "./types.js";

const filePath = "./data/tickets.json";

export async function getTickets(): Promise<Ticket[]> {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(tickets, null, 2));
}
