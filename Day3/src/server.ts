import app from "./app.js";
import pool from "./db/connection.js"

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

process.on("SIGINT", async () => {
    console.log("Shutting down server...");


    await pool.end();

    console.log("Database connections closed");

    process.exit(0);
});
