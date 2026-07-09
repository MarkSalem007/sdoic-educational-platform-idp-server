# Identity Provider (IDP) Architecture

## Overview

The Identity Provider (IDP) is the central authentication and authorization server for the Unified Educational Platform.

Responsibilities include:

- Authentication
- Session Management
- Identity Management
- Password Management
- Audit Logging
- Token Issuance
- Single Sign-On (SSO)
- Role-Based Access Control (Future)
- OAuth2/OpenID Connect (Future)

The IDP follows a layered architecture inspired by Clean Architecture and Domain-Driven Design principles.

---

# Project Structure

src/

    config/
    constants/
    dto/
    errors/
    middlewares/
    modules/
    services/
    utils/
    validators/

---

# Layer Responsibilities

## 1. Config

Purpose:

Centralized application configuration.

Contains:

- Prisma Client
- Environment Variables
- JWT Configuration
- Logger
- Application Configuration

Rules:

- Reads environment variables only.
- No business logic.
- No Prisma queries.
- No HTTP logic.

---

## 2. DTO

Purpose:

Validate incoming request payloads.

Rules:

- Uses Zod.
- No Prisma.
- No business logic.
- No HTTP responses.

Each DTO exports:

- Schema
- Validation Function

Example:

create-user.dto.js

---

## 3. Validators

Purpose:

Reusable validation components.

Examples:

- Email
- UUID
- Mobile Number
- Password Complexity
- Common Text Validators

DTOs compose validators.

Validators never know about Express.

---

## 4. Middleware

Purpose:

Cross-cutting concerns.

Examples:

- Authentication
- Authorization
- Request Context
- Idempotency
- Error Handling
- Rate Limiting

Rules:

Middleware never performs business logic.

Middleware never directly accesses Prisma.

---

## 5. Controller

Purpose:

Translate HTTP requests into business operations.

Responsibilities:

- Read Request
- Validate DTO
- Call Service
- Return HTTP Response

Controllers never:

- Query Prisma
- Generate Tokens
- Hash Passwords

Controllers should remain thin.

---

## 6. Service

Purpose:

Contains business logic.

Responsibilities:

- Business Rules
- Transactions
- Duplicate Checking
- Orchestration
- Calling Shared Services

Services never:

- Access Express Request directly
- Generate HTTP Responses

Services communicate with:

- Repository
- Shared Services

---

## 7. Repository

Purpose:

Database abstraction layer.

Repositories translate business objects into Prisma operations.

Repositories may:

- Create
- Update
- Delete
- Query

Repositories never:

- Validate
- Generate Tokens
- Hash Passwords
- Throw Business Exceptions

Repositories remain intentionally "dumb".

---

## 8. Shared Services

Purpose:

Reusable business capabilities shared by multiple modules.

Examples:

password.service.js

audit.service.js

token.service.js

session.service.js

email.service.js

Shared Services never expose HTTP endpoints.

---

## 9. Utils

Purpose:

Pure helper functions.

Examples:

- JWT Helpers
- Crypto Helpers
- Date Helpers
- Response Helpers
- Validation Helpers

Utils are stateless.

---

# Dependency Rules

Allowed

Controller

↓

Service

↓

Repository

↓

Prisma

Shared Services may be called by Services.

Not Allowed

Controller → Prisma

Controller → Repository

Middleware → Repository

Repository → Service

Repository → HTTP

---

# Transactions

Business transactions belong inside Services.

Never inside Repositories.

Example:

Service

↓

withTransaction()

↓

Repository

---

# Error Handling

Services throw custom errors.

Example:

ValidationError

ConflictError

UnauthorizedError

ForbiddenError

NotFoundError

The Error Middleware converts exceptions into HTTP responses.

---

# Request Context

Every request receives:

requestId

ipAddress

userAgent

Stored in:

req.context

Example:

req.context.requestId

---

# Audit Logging

Business actions create audit logs.

Audit logging is performed through:

audit.service.js

Never write directly into the AuditLog table.

---

# Password Policy

Passwords are managed exclusively through:

password.service.js

Responsibilities:

Generate Password

Hash Password

Verify Password

Future:

Password Strength

Password Expiration

Password History

---

# Token Policy

JWT generation occurs only inside:

token.service.js

Never generate JWTs inside Controllers.

---

# Session Policy

Sessions are managed only through:

session.service.js

Responsibilities:

Create Session

Revoke Session

Update Activity

Refresh Session

---

# Repository Convention

Repositories receive object parameters.

Good

findByEmail({

email

})

Bad

findByEmail(email)

---

# Service Convention

Services receive object parameters.

Good

createUser({

data,

context

})

Bad

createUser(data)

---

# Response Convention

Controllers always return:

successResponse()

or

Error Middleware

Controllers never manually construct response objects.

---

# Naming Convention

Modules

users.service.js

users.repository.js

users.controller.js

users.endpoints.js

Shared Services

audit.service.js

password.service.js

session.service.js

token.service.js

DTO

create-user.dto.js

login.dto.js

change-password.dto.js

---

# Business Principles

Single Responsibility Principle

Repositories perform database operations.

Services perform business logic.

Controllers perform HTTP translation.

Middleware performs cross-cutting concerns.

Shared Services provide reusable capabilities.

---

# Future Modules

Authentication

Users

Sessions

Roles

Permissions

Applications

Audit

Notifications

OAuth2

OpenID Connect

Single Sign-On

Device Management

API Keys

Organization Management

---

# Development Guidelines

Always create:

DTO

Repository

Service

Controller

Endpoints

Never skip layers.

Business logic belongs in Services.

Database logic belongs in Repositories.

Validation belongs in DTOs.

HTTP belongs in Controllers.

Cross-cutting concerns belong in Middleware.

This architecture should remain consistent throughout the lifetime of the Identity Provider.