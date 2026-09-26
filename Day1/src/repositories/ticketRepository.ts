import { TicketQuery } from "../types.js";
import { validateTicketQuery } from "../validation.js";
import { Ticket } from "../types.js";
import { db } from "../prisma/db";
import { or, and, all } from "@prisma/orm-postgres/orm-client";

export async function getTickets(query: {
    page: number;
    pageSize: number;
    status?: string;
    priority?: string;
    assignee?: string;
    search?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
}) {
    const offset = (query.page - 1) * query.pageSize;

    const filters = {
        ...(query.status && { status: query.status }),
        ...(query.priority && { priority: query.priority }),
        ...(query.assignee && { assignee: query.assignee }),
    };

    let ticketQuery = db.orm.public.Tickets;

    if (Object.keys(filters).length > 0) {
        ticketQuery = ticketQuery.where(filters);
    }

    if (query.search) {
        const pattern = `%${query.search}%`;

        console.log("SEARCH:", query.search);
        console.log("PATTERN:", pattern);
        console.log("TYPE:", typeof pattern);

        ticketQuery = ticketQuery.where((ticket) =>
            or(
                ticket.title.ilike(pattern),
                ticket.description.ilike(pattern)
            )
        );
    }

    const result = await ticketQuery
        .aggregate((agg) => ({
            total: agg.count()
        }));

    const total = result.total;
    const totalPages = Math.ceil(total / query.pageSize);

    let dataQuery = ticketQuery.select(
        "id",
        "title",
        "description",
        "priority",
        "status",
        "assignee",
        "createdAt"
    );

    if (query.sortField === "id") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.id.desc())
            : dataQuery.orderBy((ticket) => ticket.id.asc());
    }

    if (query.sortField === "title") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.title.desc())
            : dataQuery.orderBy((ticket) => ticket.title.asc());
    }

    if (query.sortField === "priority") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.priority.desc())
            : dataQuery.orderBy((ticket) => ticket.priority.asc());
    }

    if (query.sortField === "status") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.status.desc())
            : dataQuery.orderBy((ticket) => ticket.status.asc());
    }

    if (query.sortField === "assignee") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.assignee.desc())
            : dataQuery.orderBy((ticket) => ticket.assignee.asc());
    }

    if (query.sortField === "createdAt") {
        dataQuery = query.sortDirection === "desc"
            ? dataQuery.orderBy((ticket) => ticket.createdAt.desc())
            : dataQuery.orderBy((ticket) => ticket.createdAt.asc());
    }

    const tickets = await dataQuery
        .offset(offset)
        .limit(query.pageSize)
        .all();

    return {
        tickets,
        pagination: {
            page: query.page,
            pageSize: query.pageSize,
            total,
            totalPages
        }
    };
}

export async function getTicketById(id: number){
    return await db.orm.public.Tickets
        .select("id", "title", "description", "priority", "status", "assignee", "createdAt")
        .where({id})
        .first();
}

export async function createTicket(ticket: Omit<Ticket, "id">) {
    return await db.orm.public.Tickets.create({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        assignee: ticket.assignee
    });
}

export async function updateTicket(id: number, ticket: Omit<Ticket, "id">) {
    return await db.orm.public.Tickets
        .where({id})
        .update({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            assignee: ticket.assignee
        });
}

export async function deleteTicket(id: number){
    return await db.orm.public.Tickets
        .where({id})
        .delete();
}

