import { TicketQuery } from "./types";

export function isValidPriority(priority: unknown): boolean {
    return (
        priority === "low" ||
        priority === "medium" ||
        priority === "high"
    );
}

export function isValidStatus(status: unknown): boolean {
    return (
        status === "open" ||
        status === "in-progress" ||
        status === "resolved"
    );
}

export function validateCreateTicket(body: unknown): string | null {
    if (typeof body !== "object" || body === null) {
        return "Request body must be an object";
    }

    const input = body as {
        title?: unknown;
        description?: unknown;
        priority?: unknown;
    }

    if (typeof input.title !== "string" || input.title.trim() === "") {
        return "Title is required";
    }

    if (
        typeof input.description !== "string" ||
        input.description.trim() === ""
    ) {
        return "Description is required";
    }

    if (!isValidPriority(input.priority)) {
        return "Priority must be low, medium or high";
    }

    return null;
}


export function isValidAssignee(assignee:unknown): boolean {
    return assignee === null ||
        (typeof assignee ==="string" && assignee.trim() !== "");
}

export function isValidId(id: string): boolean {
    const numberId = Number(id);
    return Number.isInteger(numberId) && numberId > 0;
}

export function validateTicketQuery(query: TicketQuery) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);

    console.log(query);

    if (!Number.isInteger(page) || page < 1) {
        throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
        throw new Error("pageSize must be between 1 and 50");
    }

    const validStatuses = ["open", "in-progress", "resolved"];
    const validPriorities = ["low", "medium", "high"];
    const validSortFields = ["id", "title", "priority", "status", "assignee", "createdAt"];
    const validSortDirections = ["asc", "desc"];

    if(query.status && !validStatuses.includes(query.status)) {
        throw new Error("Invalid status");
    }

    if(query.priority && !validPriorities.includes(query.priority)) {
        throw new Error("Invalid priority");
    }

    if(query.sortDirection && !validSortDirections.includes(query.sortDirection)) {
        throw new Error("Invalid sort direction");
    }

    if (query.sortField && !validSortFields.includes(query.sortField)) {
        throw new Error("Invalid sort field");
    }

    if (query.search !== undefined && query.search.trim() === "") {
        throw new Error("Search cannot be empty");
    }

    return {
        page, pageSize,
        status: query.status,
        priority: query.priority,
        assignee: query.assignee,
        search: query.search,
        sortField: query.sortField,
        sortDirection: query.sortDirection
    };
}
