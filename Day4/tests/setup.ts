import dotenv from "dotenv";

dotenv.config({
    path: ".env.test"
});

console.log("TEST DATABASE:", process.env.DATABASE_URL);