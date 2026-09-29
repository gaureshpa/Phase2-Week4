import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { response } from "express";

describe("Authentication API", () => {
    it("should register a new user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Test User",
                email: `test-${Date.now()}@gmail.com`,
                password: "password"
            });
        
        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe("Test User");
        expect(response.body.email).toContain("@gmail.com");

        expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("should reject registration when required fields are missing", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Test User",
                email: "user0@test.com"
            });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            error: "Name, email and password are required"
        });
    });

    it("should reject registration with an existing email", async () => {
        const email = `duplicate-${Date.now()}@example.com`;

        await request(app)
            .post("/auth/register")
            .send({
                name: "First User",
                email,
                password: "password123"
            });
        
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Second user",
                email,
                password: "password@1234#"
            });
        
        expect(response.body).toEqual({
            error: "Email already registered"
        });
    });

    it("should login with valid credentials", async () => {
        const email = `login-${Date.now()}@example.com`;
        const password = "password123";

        await request(app)
            .post("/auth/register")
            .send({
                name: "Login User",
                email,
                password
            });
        
        const response = await request(app)
            .post("/auth/login")
            .send({
                email, password
            });
        
        expect(response.status).toBe(200);
    });

    it("should reject login with wrong password", async () => {
        const email = `wrong-mail-${Date.now()}@example.com`;

        await request(app)
            .post("/auth/register")
            .send({
                name: "Test User",
                email,
                password: "password123"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                email,
                password: "helloworld"
            });
        
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: "Invalid credentials"
        });
    });

    it("should reject login with a nonexisting email", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: `doesnotexist-${Date.now()}@test.com`,
                password: "pasword"
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: "Invalid credentials"
        });
    });

    it("should return current user with a valid token", async () => {
        const email = `me-${Date.now()}@test.com`;
        const password = "password";

        await request(app)
            .post("/auth/register")
            .send({
                name: "Current User",
                email,
                password
            });
        
        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email, password
            });


        const token = loginResponse.body.accessToken;

        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);

        expect(response.body.name).toBe("Current User");
        expect(response.body.email).toBe(email);
        expect(response.body).toHaveProperty("id");
        expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("should reject /auth/me without a token", async () => {
        const response = await request(app)
            .get("/auth/me");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: "Authentication required"
        });
    });

    it("should reject /auth/me with an invalid token", async () => {
        const response = await request(app)
            .get("/auth/me")
            .set("Authorization", "Bearer invalid_token");

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: "Invalid or expired token"
        });
    });

    it("should reject ticket requests without authentication", async () => {
        const response = await request(app)
            .get("/tickets");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: "Authentication required"
        });
    });

    it("should allow ticket requests with a valid token", async () => {
        const email = `ticket-auth-${Date.now()}@test.com`;
        const password = "password123";

        await request(app)
            .post("/auth/register")
            .send({
                name: "Ticket User",
                email,
                password
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email, password
            });

        const token = loginResponse.body.accessToken;

        const response = await request(app)
            .get("/tickets")
            .set("Authorization",  `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

});
