import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

const users = {
    customer: {
        email: "alice@example.com",
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

const token = await login(users.customer.email, users.customer.password);

describe("Security protections", () => {
    it("rejects JSON bodies larger than 10KB", async () => {
        const largePayload = {
            title: "A".repeat(200),
            description: "A".repeat(10_000),
            priority: "low"
        };

        const response = await request(app)
            .post("/tickets")
            .set("Content-Type", "application/json")
            .send(largePayload);

        expect(response.status).toBe(413);
    });

    it("adds security headers", async () => {
        const response = await request(app)
            .get("/auth/me");

        expect(response.header["x-content-type-options"]).toBe("nosniff");
    });

    it("allows cross-origin requests", async () => {
        const response = await request(app)
            .get("/auth/me")
            .set("Origin", "http://example.com");

        expect(response.headers["access-control-allow-origin"]).toBe("*");
    });

    it("rejects a ticket title longer than 200 characters", async () => {

        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "A".repeat(201),
                description: "Valid description",
                priority: "low"
            });

        expect(response.status).toBe(400);
    });

    it("rejects a ticket description longer than 5000 characters", async () => {

        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Valid title",
                description: "A".repeat(5001),
                priority: "low"
            });

        expect(response.status).toBe(400);
    });

    it("rejects an invalid assigneeId", async () => {

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                assigneeId: "abc"
            });
        
        expect(response.status).toBe(400);
    });

    it("handles SQL-like search input safely", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                search: "' OR 1=1 --"
            });
        
        expect(response.status).toBe(200);
    });

});