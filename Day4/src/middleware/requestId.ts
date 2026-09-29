import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";

export function requestId(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const id = randomUUID();
    
    res.locals.requestId = id;
    res.setHeader("X-Request-ID", id);

    next();
}