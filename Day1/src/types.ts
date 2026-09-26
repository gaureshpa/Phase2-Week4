export interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in-progress" | "resolved";
    assignee: string | null;
}

export interface CreateTicketInput {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
}

export interface TicketQuery {
    page?: string;
    pageSize?: string;
    status?: "open" | "in-progress" | "resolved"
    priority?: "low" | "medium" | "high"
    assignee?: string;
    search?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
}
