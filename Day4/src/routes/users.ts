import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";
import { db } from "../prisma/db";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/", async (req: AuthenticatedRequest, res) => {
    const users = await db.orm.public.Users
        .select("id", "name", "email", "role", "createdAt")
        .all();

    res.json(users);
});

export default router;
