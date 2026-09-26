import express from "express";
import ticketRoutes from "./routes/tickets.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(express.json());
app.use("/tickets", ticketRoutes);
app.use("/auth", authRouter);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});

export default app;
