import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

let token: string;

beforeAll(async () => {
    const email = `api-test-${Date.now()}@test.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "API Test User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email, password
        });

    token = loginResponse.body.accessToken
})

describe("Ticket API", () => {

    it("should create a ticket", async () => {
        const response = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Dark Mode Problem",
                description: "Can't toggle to dark mode",
                priority: "high"
            });

        expect(response.status).toBe(201);
    });


    it("should get all tickets", async () => {
        await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Dark Mode Problem",
                description: "Can't toggle to dark mode",
                priority: "high"
            });
        
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it("should get a ticket by ID", async () => {
        const createResponse = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Dark Mode Problem",
                description: "Can't toggle to dark mode",
                priority: "high"
            });
        
        const id = createResponse.body.id;
        const response = await request(app)
            .get(`/tickets/${id}`)
            .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(id);
    });


    it("should update ticket status", async () => {
        const createResponse = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Dark Mode Problem",
                description: "Can't toggle to dark mode",
                priority: "high"
            });
        
        const id = createResponse.body.id;
        const response = await request(app)
            .patch(`/tickets/${id}/update`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "resolved"
            });
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("resolved");
    });


    it("should delete a ticket", async () => {
        const createResponse = await request(app)
            .post("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Dark Mode Problem",
                description: "Can't toggle to dark mode",
                priority: "high"
            });
        
        const id = createResponse.body.id;
        const response = await request(app)
            .delete(`/tickets/${id}`)
            .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Ticket deleted successfully");
    });

    // New Tests

    it("should paginate tickets", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                page: 1,
                pageSize: 2
            });

        expect(response.status).toBe(200);
        expect(response.body.tickets.length).toBeLessThanOrEqual(2);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.pageSize).toBe(2);
    });


    it("should filter tickets by status", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                status: "open"
            });

        expect(response.status).toBe(200);

        for(const ticket of response.body.tickets) {
            expect(ticket.status).toBe("open");
        }
    });


    it("should filter tickets by priority", async () => {
        const response = await request (app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                priority: "high"
            });

        expect(response.status).toBe(200);

        for(const ticket of response.body.tickets) {
            expect(ticket.priority).toBe("high");
        }
    });


    it("should search tickets", async () => {
        const search = "Login issue";

        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                search
            });
        
        expect(response.status).toBe(200);

        for (const ticket of response.body.tickets) {
            const matchesTitle = ticket.title.toLowerCase().includes(search.toLocaleLowerCase());
            const matchesDescription = ticket.description.toLowerCase().includes(search.toLowerCase());

            expect(matchesTitle || matchesDescription).toBe(true);
        }
    });


    it("should reject an invalid page size", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                pageSize: 100
            });

        expect(response.status).toBe(400);
    });

    it("should sort tickets by title", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                sortField: "title",
                sortDirection: "asc"
            });

        expect(response.status).toBe(200);

        const titles = response.body.tickets.map(
            (ticket: { title: string }) => ticket.title
        );

        for (let i = 1; i < titles.length; i++) {
            expect(titles[i-1].localeCompare(titles[i])).toBeLessThanOrEqual(0);
        }

    });

    it("should reject an invalid sort field", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                sortField: "invalid"
            });

        expect(response.status).toBe(400);
    });


    it("should reject an invalid status", async() => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                status: "invalid"
            });
        
        expect(response.status).toBe(400);
    });

    it("should filter tickets by assignee", async () => {
        const response = await request(app)
            .get("/tickets")
            .set("Authorization", `Bearer ${token}`)
            .query({
                assignee: "Aadith"
            });

        for (const ticket of response.body.tickets) {
            expect(ticket.assignee).toBe("Aadith");
        }
    });

});