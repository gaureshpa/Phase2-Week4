import { Router } from "express";
import pool from "../db/connection";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ok",
            database: "ok"
        });
    } catch {
        res.status(503).json({
            status: "degraded",
            database: "unavailable"
        });
    }
});

export default router;
