import express from "express";
import ticketRoutes from "./routes/tickets.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT ?? 100),
    standardHeaders: "draft-8",
    legacyHeaders: false
});

const app = express();

app.use(apiLimiter);
app.use(helmet()); // secure HTTP headers
app.use(cors()); // add CORS
app.use(express.json( { limit: "10kb" } )); // body-size limit

app.use("/tickets", ticketRoutes);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.use((err: Error & { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);

    res.status(err.status ?? 500).json({
        message: err.status === 413
            ? "Request body too large"
            : "Internal server error"
    });
});

export default app;
