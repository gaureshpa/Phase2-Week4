import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

type Role = "CUSTOMER" | "AGENT" | "ADMIN";

export function requireRole(role: Role) {
    return(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (req.userRole !== role) {
            return res.status(403).json({
                error: "Forbidden"
            });
        }
        next();
    };
}

export function canAccessTicket(
    userId: number,
    role: string,
    ticket: {
        customerId: number;
        assigneeId: number | null;
    }
): boolean {
    if(role === "ADMIN") {
        return true
    }

    if (role === "CUSTOMER") {
        return ticket.customerId === userId;
    }

    if (role === "AGENT") {
        return ticket.assigneeId === userId;
    }

    return false;
}
