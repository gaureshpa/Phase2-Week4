import { Router } from "express";
import {
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket
} from "../repositories/ticketRepository.js";
import {
    validateCreateTicket,
    isValidId,
    validateTicketQuery
} from "../validation.js";
import { TicketQuery } from "../types.js";
import { canAccessTicket } from "../middleware/authorize.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// GET /tickets
router.get("/", async (req: AuthenticatedRequest, res) => {
    try {
        const query = validateTicketQuery(req.query as unknown as TicketQuery);

        const result = await getTickets(req.userId!, req.userRole!, query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            error: (error as Error).message
        });
    }
});

// POST /tickets
router.post("/", async (req: AuthenticatedRequest, res) => {

    if(req.userRole !== "CUSTOMER" && req.userRole !== "ADMIN") {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    const error = validateCreateTicket(req.body);

    if (error) {
        res.status(400).json({
            message: error
        });
        return;
    }

    const input = req.body;

    const ticket = await createTicket({
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "open",
        assigneeId: null,
        customerId: req.userId!
    });

    res.status(201).json(ticket);
});

// GET /tickets/:id
router.get("/:id", async (req: AuthenticatedRequest, res) => {
    const idParam = req.params.id as string;
    if (!isValidId(idParam)) {
        res.status(400).json({
            message: "Invalid ticket ID"
        });
        return;
    }

    const id = Number(req.params.id);

    const ticket = await getTicketById(id);

    if (!ticket) {
        res.status(404).json({
            message: "Ticket not found"
        });
        return;
    }

    const hasAccess = canAccessTicket(
        req.userId!,
        req.userRole!,
        ticket
    );

    if (!hasAccess) {
        return res.status(403).json({
            error: "Forbidden"
        });
    }
    
    res.json(ticket);
});

// PATCH /tickets/:id/update
router.patch("/:id/update", async (req: AuthenticatedRequest, res) => {
    const idParam = req.params.id as string;
    if (!isValidId(idParam)) {
        res.status(400).json({
            message: "Invalid ticket ID"
        });
        return;
    }

    const id = Number(req.params.id);

    const ticket = await getTicketById(id);

    if (!ticket) {
        res.status(404).json({
            message: "Ticket not found"
        });
        return;
    }

    console.log({
        userId: req.userId,
        role: req.userRole,
        ticket
    })

    const hasAccess = canAccessTicket(req.userId!, req.userRole!, ticket);

    if(!hasAccess) {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    const updatedTicket = await updateTicket(id, {
        ...ticket,
        ...req.body
    });

    res.json(updatedTicket);
});

// DELETE /tickets/:id
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
    const idParam = req.params.id as string;
    if (!isValidId(idParam)) {
        res.status(400).json({
            message: "Invalid ticket ID"
        });
        return;
    }

    const id = Number(req.params.id);

    const ticket = await getTicketById(id);

    if (!ticket) {
        res.status(404).json({
            message: "Ticket not found"
        });
        return;
    }

    if (req.userRole === "AGENT") {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    const hasAccess = canAccessTicket(req.userId!, req.userRole!, ticket);

    if(!hasAccess) {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    await deleteTicket(id);

    res.json({
        message: "Ticket deleted successfully"
    });
});

export default router;
