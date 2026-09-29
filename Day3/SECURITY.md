# Security Review

## Identified Risks and Mitigations

### 1. Oversized JSON requests
Risk:
Large request bodies could consume excessive memory or resources.

Mitigation:
JSON request bodies are limited to 10KB.

### 2. Missing security header
Risk:
The API did not previously send common security-related HTTP headers.

Mitigation:
Helmet is enabled globally

### 3. Unrestricted cross-origin requests
Risk: 
An overly broad CORS policy can allow broswer clients from unknown origins to access the API.

Mitigation:
CORS is enabled. The current configuration uses the default premissive policy because there is no connected frontend yet.

#### 4. Excessive request volume
Risk:
Repeated requests could consume server resources pr be used for brute force attempts.

Mitigation: 
A global rate limiter allows 100 requests per 15 minutes per client.

### 5. Excessively large ticket fields
Risk: 
Very large title or description values could consume unnecessary storage and processing resources.

Mitigation:
Ticket titles are limited to 200 characters and description to 5000 characters.

### 6. Invalid query parameters
Risk:
Unexpected pagination, status, priority, sorting, assignee values could cause invalid querires or unexpected application behaviour.

Mitigation:
Query paramaters are validated using explicit allowlists and numeric validation. Page size is limited to 50.

### 7. SQL Injection
Risk:
User-controlled search and query values could potentially be used to contruct malicious database queries.

Mitigation:
Database access use Prisma ORM rather than manually constructed SQL. Search values are passed through ORM query methods and sort fields and directions are explicitly allowlisted.

### 8. Information exposure through errors
Risk:
Returning internal error details to clients could expose implementation information.

Mitigation:
The API returns generic internal-server-error  responses while logging server-side-errors. Body-size errors return an appropriate 413 response.

## Security Tests

The following protections are covered by automation tests:

- JSON body-size limit
- Helmet security headers
- CORS
- Ticket field length validation
- `assigneeId` validation
- SQL-like search input
- Rate limiting

## Residual Risks

- CORS currently uses a permissive policy because no frontend origin has been configured yet. A production deployment should restrict allowed origins.
- The global rate limiter is a general protection and does not provide seperate limits for sensitive operations such as login.
- Authentication secrets and database credentials must be provided trough environment variables and must not be committed to source control.
- Security depends on keeping dependencies and the runtime environment updated.
