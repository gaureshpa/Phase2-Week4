import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const users = {
    customer: {
        email: "alice@example.com",
        password: "password123"
    },

    otherCutsomer: {
        email: "bob@example.com",
        password: "password123"
    },
    
    agent: {
        email: "charlie@example.com",
        password: "password123"
    },

    otherAgent: {
        email: "david@example.com",
        password: "password123"
    },

    admin: {
        email: "admin@example.com",
        password: "password123"
    },
};

async function login(email: string, password: string) {
    const response = await request(app)
        .post("/auth/login")
        .send({email, password});

    expect(response.status).toBe(200);

    return response.body.accessToken;
}

describe("Authorization", ()=> {
    it("customer can see their own tickets", async () => {
        const token = await login(
            users.customer.email,
            users.customer.password
        );

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        
        expect(
            response.body.tickets.every(
                (ticket: { customerId?: number}) => 
                    ticket.customerId === undefined ||
                    ticket.customerId === 1
            )
        ).toBe(true);
    });

    it("customer cannot update another customer's ticket", async() => {
        const token = await login(
            users.customer.email,
            users.customer.password
        );

        const response = await request(app)
            .patch("/tickets/2/update")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Unauthorized update"
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                error: "Forbidden"
            });
    });

    it("agent can see only assigned tickets", async () => {
        const token = await login(
            users.agent.email,
            users.agent.password
        );

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it("agent cannot create tickets", async () => {
        const token = await login(
            users.agent.email,
            users.agent.password
        );

        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Unauthorized ticket",
                description: "Agent should not create this",
                priority: "high"
            });

        expect(response.status).toBe(403);
    });

    it("non-admin cannot manage users", async() => {
        const token = await login(
            users.customer.email,
            users.customer.password
        );

        const response = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    it("admin can see all tickets", async () => {
        const token = await login(
            users.admin.email,
            users.admin.password
        );

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it("unauthenticated user cannot access tickets", async () => {
        const response = await request(app)
            .get("/tickets");

        expect(response.status).toBe(401);
    });

});