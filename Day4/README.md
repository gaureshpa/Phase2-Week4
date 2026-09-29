# Support Ticket API

A REST API for managing support tickets using Node.js, Express, TypeScript, PostgreSQL, and Prisma.

The API includes authentication, role-based authorization, ticket management, pagination, filtering, searching, sorting, security protections, structured logging, and a database health check.

## Features

### Authentication

* User registration
* Password hashing with bcrypt
* User login
* JWT access tokens
* Protected routes
* Current authenticated user endpoint
* Generic authentication error messages

### Authorization

* Role-based access control
* CUSTOMER users can access their own tickets
* AGENT users can access tickets assigned to them
* ADMIN users can manage all tickets
* Only ADMIN users can access user administration
* Restricted resources return `403 Forbidden`
* Customer identity is taken from the authenticated JWT rather than the request body

### Tickets

* Create tickets
* List tickets
* Get a ticket by ID
* Update tickets
* Delete tickets
* Pagination
* Filtering by status, priority, and assignee
* Search
* Sorting
* Input validation

### Security

* Helmet security headers
* CORS
* Global rate limiting
* 10 KB JSON request-body limit
* Ticket title and description length limits
* Assignee ID validation
* Query parameter allowlists
* Parameterized/ORM database access
* Generic internal server error responses

### Operational Readiness

* Structured JSON logs
* Request/correlation IDs
* Request duration logging
* Structured error logging
* Database health check
* OpenAPI API documentation
* `.env.example` configuration template

## Tech Stack

* Node.js
* TypeScript
* Express
* PostgreSQL
* Prisma
* bcryptjs
* jsonwebtoken
* Helmet
* CORS
* express-rate-limit
* Vitest
* Supertest

## Requirements

* Node.js
* PostgreSQL
* npm

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with your local PostgreSQL database and JWT secret.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/support_ticket_db
JWT_SECRET=replace-with-a-long-random-secret
RATE_LIMIT=100
```

Never commit the real `.env` file or expose the JWT secret.

## Database Setup

Create the PostgreSQL database:

```bash
createdb support_ticket_db
```

Update the database structure using Prisma:

```bash
npx prisma db update
```

Generate the Prisma contract/client if required:

```bash
npx prisma contract emit
```

If seed data is required:

```bash
npm run seed
```

Make sure PostgreSQL is running before starting the application.

## Running the Project

### Development

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:3000
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Health Check

The API provides a health endpoint:

```http
GET /health
```

Example:

```bash
curl http://localhost:3000/health
```

Healthy response:

```json
{
  "status": "ok",
  "database": "ok"
}
```

If the database is unavailable, the endpoint returns HTTP `503`.

## Authentication

### Register

```http
POST /auth/register
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "createdAt": "..."
}
```

Passwords are hashed before being stored.

### Login

```http
POST /auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "accessToken": "..."
}
```

The access token is a JWT and expires after one hour.

### Get Current User

```http
GET /auth/me
```

Requires:

```http
Authorization: Bearer <accessToken>
```

Example:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## Authorization

Protected endpoints require a valid JWT.

The API uses three roles:

| Role     | Access                              |
| -------- | ----------------------------------- |
| CUSTOMER | Own tickets                         |
| AGENT    | Assigned tickets                    |
| ADMIN    | All tickets and user administration |

Authorization is enforced on the server.

Users cannot override their permissions by modifying request data.

Unauthorized access returns:

```json
{
  "error": "Forbidden"
}
```

## Ticket Endpoints

### Get Tickets

```http
GET /tickets
```

Requires authentication.

Supported query parameters:

```text
page
pageSize
status
priority
assigneeId
search
sortField
sortDirection
```

Example:

```http
GET /tickets?page=1&pageSize=10
```

Filtering:

```http
GET /tickets?status=open
GET /tickets?priority=high
GET /tickets?assigneeId=2
```

Search:

```http
GET /tickets?search=login
```

Sorting:

```http
GET /tickets?sortField=title&sortDirection=asc
```

Valid statuses:

```text
open
in-progress
resolved
```

Valid priorities:

```text
low
medium
high
```

Valid sort fields:

```text
id
title
priority
status
assignee
createdAt
```

Valid sort directions:

```text
asc
desc
```

`pageSize` must be between `1` and `50`.

### Create Ticket

```http
POST /tickets
```

Requires authentication.

Customers and administrators can create tickets.

Request:

```json
{
  "title": "Login issue",
  "description": "Customer cannot log in",
  "priority": "high"
}
```

The customer ID is taken from the authenticated user.

### Get Ticket

```http
GET /tickets/:id
```

Requires authentication and authorization for the requested ticket.

Example:

```http
GET /tickets/1
```

### Update Ticket

```http
PATCH /tickets/:id/update
```

Requires authentication and authorization.

Example:

```json
{
  "status": "in-progress",
  "priority": "high"
}
```

### Delete Ticket

```http
DELETE /tickets/:id
```

Requires authentication and authorization.

## User Administration

### Get Users

```http
GET /users
```

Administrator access is required.

The endpoint returns user information without password hashes.

## Pagination Response

The ticket list includes pagination metadata:

```json
{
  "tickets": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Request IDs and Structured Logs

Every request receives a unique request ID.

The API returns it through:

```http
X-Request-ID: <request-id>
```

Request logs contain structured information such as:

```json
{
  "timestamp": "...",
  "level": "info",
  "message": "Request completed",
  "requestId": "...",
  "method": "GET",
  "path": "/tickets",
  "statusCode": 200,
  "durationMs": 12
}
```

Errors are also logged using the same request ID, making it possible to correlate request and error logs.

Sensitive information such as passwords, JWT tokens, authorization headers, and environment secrets is not logged.

## API Documentation

The OpenAPI specification is available at:

```text
docs/openapi.yaml
```

It documents:

* Health endpoint
* Authentication endpoints
* Ticket endpoints
* User endpoints
* Authentication requirements
* Request parameters
* Request bodies
* Response codes
* JWT bearer authentication

The OpenAPI file can be imported into an OpenAPI-compatible documentation tool such as Swagger UI.

## Environment Variables

Copy the example configuration:

```bash
cp .env.example .env
```

Available variables:

| Variable       | Description                           | Example                                                       |
| -------------- | ------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string          | `postgresql://user:password@localhost:5432/support_ticket_db` |
| `JWT_SECRET`   | Secret used to sign JWTs              | `your-long-random-secret`                                     |
| `RATE_LIMIT`   | Maximum requests per 15-minute window | `100`                                                         |

Do not commit `.env` or expose secret values.

## Testing

Run the test suite:

```bash
npm test
```

The tests cover authentication, authorization, ticket operations, validation, pagination, filtering, sorting, and security-related behavior.

## Build Verification

Compile the TypeScript project:

```bash
npm run build
```

A successful build confirms that the TypeScript source compiles correctly.

## Project Structure

```text
src/
├── app.ts
├── server.ts
├── db/
│   └── connection.ts
├── middleware/
│   ├── auth.ts
│   ├── authorize.ts
│   ├── requestId.ts
│   └── requestLogger.ts
├── prisma/
│   └── ...
├── repositories/
│   ├── ticketRepository.ts
│   └── userRepository.ts
├── routes/
│   ├── auth.ts
│   ├── health.ts
│   ├── tickets.ts
│   └── users.ts
├── utils/
│   └── logger.ts
├── validation.ts
└── types.ts

docs/
└── openapi.yaml

.env.example
SECURITY.md
README.md
```

## Security Documentation

Security risks, mitigations, and remaining considerations are documented in:

```text
SECURITY.md
```

## Quick Start

For a new developer, the shortest setup path is:

```bash
npm install
cp .env.example .env
```

Configure the PostgreSQL connection and JWT secret in `.env`.

Then:

```bash
createdb support_ticket_db
npx prisma db update
npx prisma contract emit
npm run build
npm test
npm run dev
```

Verify the service:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok",
  "database": "ok"
}
```
