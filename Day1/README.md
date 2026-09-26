## TicketAPI: Authentication

The project supports ticket management, pagination, filtering, comments, status history, and user authentication using password hashing and JWT access tokens.

## Authentication Features

- User registration
- Secure password hashing with bcrypt
- User login
- JWT access tokens
- Protected API routes
- Current authenticated user endpoint
- Generic login error messages to avoid information leakage

## Tickets

- Create tickets
- List tickets
- Get ticket by ID
- Update ticket status
- Delete tickets
- Pagination
- Filtering by priority
- Filtering by assignee
- Search tickets
- Sorting
- Input validation

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- bcryptjs
- JSON Web Token
- Vitest
- Supertest

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE URL="postgresql://username:password@localhost:5432/support_ticket_db"
```

```env
JWT_SECRET = "your-secret=key
```

## Database Setup

Create the PostgreSQL database:

`createdb support_ticket_db`

Then update the database structure using Prisma:

`npx prisma db update`

Generate the Prisma contract/client if required:

`npx prisma contract emit`

If the project contains seed data, run:

`npx prisma db seed`

## Authentication

### Regsiter

`POST /auth/register`

Request:

```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123"
}
```

Successful response:

```json
{
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "createdAt": "...."
}
```

### Login

`POST /auth/login`

Request:

```json
{
    "email": "johndoe@example.com",
    "password": "password123"
}
```

Successful response:

```json
{
    "accessToken": "..."
}
```

The password is verified against the stored bcrypt hash. 

### Get Current User

`GET /auth/me`

Requires:

`Authorization: Bearer <accessToken>`

Example response:

```json
{
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "createdAt": "..."
}
```

### Protected Routes

Tickets endpoints require a valid JWT access token.

Example:

`GET /tickets`

`Authorization: Bearer <accessToken>`

Requests without a valid token returns:

```json
{
    "error": "Authentication required"
}
```