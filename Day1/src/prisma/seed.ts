import { db } from "./db";

async function main() {
    await db.orm.public.Tickets.create({
        title: "Login issue",
        description: "User cannot log in to the application",
        priority: "high",
        status: "open",
        assignee: "John"
    });

    await db.orm.public.Tickets.create({
        title: "Update profile",
        description: "User needs help updating their profile",
        priority: "medium",
        status: "in-progress",
        assignee: "Sarah"
    });

    await db.orm.public.Tickets.create({
        title: "Password rest",
        description: "User requested a password reset",
        priority: "low",
        status: "resolved",
        assignee: null
    });


    console.log("Seed data inserted");
}

main() 
    .catch(console.error)
    .finally(async () => {
        await db.close();
    });
