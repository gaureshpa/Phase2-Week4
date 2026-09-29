import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

async function main() {
    console.log("Seeding database...");

    const passwordHash = await bcrypt.hash("password123", 12);

    // Users
    const alice = await db.orm.public.Users.create({
        name: "Alice Customer",
        email: "alice@example.com",
        passwordHash,
        role: "CUSTOMER",
    });

    const bob = await db.orm.public.Users.create({
        name: "Bob Customer",
        email: "bob@example.com",
        passwordHash,
        role: "CUSTOMER",
    });

    const charlie = await db.orm.public.Users.create({
        name: "Charlie Agent",
        email: "charlie@example.com",
        passwordHash,
        role: "AGENT",
    });

    const david = await db.orm.public.Users.create({
        name: "David Agent",
        email: "david@example.com",
        passwordHash,
        role: "AGENT",
    });

    const admin = await db.orm.public.Users.create({
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
    });

    // Tickets
    await db.orm.public.Tickets.create({
        title: "Login issue",
        description: "Unable to log into the application",
        priority: "high",
        status: "open",
        customerId: alice.id,
        assigneeId: charlie.id,
    });

    await db.orm.public.Tickets.create({
        title: "Profile update",
        description: "Unable to update profile information",
        priority: "medium",
        status: "open",
        customerId: bob.id,
        assigneeId: david.id,
    });

    await db.orm.public.Tickets.create({
        title: "Password reset",
        description: "Customer needs help resetting their password",
        priority: "high",
        status: "open",
        customerId: alice.id,
        assigneeId: david.id,
    });

    await db.orm.public.Tickets.create({
        title: "Dark mode problem",
        description: "Dark mode is not working correctly",
        priority: "low",
        status: "open",
        customerId: bob.id,
        assigneeId: null,
    });

    console.log("Database seeded successfully.");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });

    