import { Router } from "express";
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket } from "../repositories/ticketRepository.js";
import { validateCreateTicket, isValidId, validateTicketQuery } from "../validation.js";
import { TicketQuery } from "../types.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res) => {
    try {
        const query = validateTicketQuery(req.query as TicketQuery);

        const result = await getTickets(query);
        res.json(result);
    } catch(error) {
        res.status(400).json({
            error: (error as Error).message
        });
    }
});

router.post("/", async(req, res) => {
    const error = validateCreateTicket(req.body);

    if (error) {
        res.status(400).json({
            messagge: error
        });
        return;
    }

    const input = req.body; 
    
    const ticket = await createTicket({
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "open",
        assignee: null
    });

    res.status(201).json(ticket);
})

router.get("/:id", async(req, res) => {

    if (!isValidId(req.params.id)) {
        res.status(400).json({
            message: "Invalid ticket ID"
        });
        return;
    }

    const id = Number(req.params.id);
    const ticket = await getTicketById(id);

    if(!ticket) {
        res.status(404).json({
            message: "Ticket not found"
        });
        return;
    }

    res.json(ticket);
});


router.patch("/:id/update", async(req, res) => {

    if(!isValidId(req.params.id)) {
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

    const updatedTicket = await updateTicket(id, {...ticket, ...req.body});
    res.json(updatedTicket);
});


router.delete("/:id", async(req, res) => {

    if (!isValidId(req.params.id)) {
        res.status(400).json({
            message: "Invalid ticket ID"
        });
        return;
    }

    const id = Number(req.params.id);
    const ticket = await deleteTicket(id);

    if (!ticket) {
        res.status(404).json({
            message: "Ticket not found"
        });
        return;
    }

    res.json({
        message: "Ticket deleted successfully"
    });

});

export default router;