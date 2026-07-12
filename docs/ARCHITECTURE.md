# Identity Provider (IDP) Architecture

## Overview

The Identity Provider (IDP) is the central authentication and identity service for the Unified Educational Platform.

Its responsibilities include:

- Authentication
- Session Management
- Identity Management
- Password Management
- Refresh Token Rotation
- Audit Logging
- JWT Issuance
- Single Sign-On (SSO)
- Role-Based Access Control (Future)
- OAuth2 / OpenID Connect (Future)

The IDP follows a layered architecture inspired by Clean Architecture and Domain-Driven Design (DDD).

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

## Config

Purpose

Centralized application configuration.

Contains

- Environment Variables
- Prisma Client
- JWT Configuration
- Logger
- Application Configuration

Rules

- Reads environment variables only.
- No business logic.
- No Prisma queries.
- No HTTP logic.

---

## DTO

Purpose

Validate incoming request payloads.

Uses

- Zod

Rules

- No Prisma
- No business logic
- No HTTP responses

Each DTO exports

- Schema
- Validation Function

Example

create-user.dto.js

login.dto.js

change-password.dto.js

---

## Validators

Purpose

Reusable validation utilities shared across the application.

Examples

- UUID validation
- Password validation
- Email validation
- Refresh Token validation
- Session validation

Validators never access Express or Prisma.

---

## Middleware

Purpose

Cross-cutting concerns.

Examples

- Authentication
- Authorization
- Request Context
- Idempotency
- Error Handling
- Rate Limiting

Rules

- No business logic
- No database queries
- No response formatting

---

## Controller

Purpose

Translate HTTP requests into business operations.

Responsibilities

- Read Request
- Validate DTO
- Call Service
- Return Response

Controllers never

- Query Prisma
- Hash Passwords
- Generate JWTs

Controllers should remain thin.

---

## Service

Purpose

Contains business logic.

Responsibilities

- Business Rules
- Transactions
- Session orchestration
- Refresh token rotation
- Password workflows
- Calling shared services

Services never

- Read Express Request directly
- Generate HTTP responses

---

## Repository

Purpose

Database abstraction layer.

Repositories only perform Prisma operations.

Repositories never

- Validate input
- Throw business exceptions
- Generate JWTs
- Hash passwords

Repositories remain intentionally dumb.

---

## Shared Services

Reusable business capabilities.

Examples

- password.service.js
- audit.service.js
- refresh-token.service.js
- session.service.js

Shared services never expose HTTP endpoints.

---

## Utils

Purpose

Stateless helper functions.

Examples

- JWT helpers
- Crypto helpers
- Date helpers
- Response helpers

Utils contain no business logic.

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

Repository → Service

Repository → HTTP

Middleware → Repository

---

# Transactions

Business transactions belong only inside Services.

Example

Service

↓

withTransaction()

↓

Repository

---

# Error Handling

Services throw custom errors.

Examples

- ValidationError
- AuthenticationError
- AuthorizationError
- ConflictError
- NotFoundError

The Error Middleware converts exceptions into HTTP responses.

---

# Request Context

Every request receives

- requestId
- ipAddress
- userAgent

Stored inside

req.context

Example

req.context.requestId

---

# Audit Logging

Business actions create audit logs through

audit.service.js

Never write directly into the AuditLog table.

---

# Password Policy

Passwords are managed exclusively through

password.service.js

Responsibilities

- Hash Password
- Compare Password
- Generate Password

Future

- Password History
- Password Expiration
- Password Strength

---

# Token Policy

JWTs are generated only through

utils/jwt.js

Responsibilities

- Access Token
- Refresh Token
- Verification
- JTI Generation

Controllers never generate JWTs.

---

# Refresh Token Rotation

The IDP implements Refresh Token Rotation.

Flow

Login

↓

Issue Access Token

↓

Issue Refresh Token

↓

Store Hashed Refresh Token

↓

Refresh Request

↓

Verify Refresh Token

↓

Revoke Previous Refresh Token

↓

Issue New Access Token

↓

Issue New Refresh Token

↓

Update Stored Refresh Token

Old refresh tokens become unusable immediately.

---

# Session Management

Sessions are managed exclusively through

session.service.js

Responsibilities

- Create Session
- Update Activity
- List Sessions
- Revoke Session
- Logout Current Session
- Logout All Sessions

Every login creates a new session.

---

# Repository Convention

Repositories always receive object parameters.

Good

findByEmail({

email

})

Bad

findByEmail(email)

---

# Service Convention

Services always receive object parameters.

Good

createUser({

data,

context

})

Bad

createUser(data)

---

# Controller Convention

Controllers

- Validate DTO
- Call Service
- Return successResponse()

Nothing more.

---

# Response Convention

Successful responses always use

successResponse()

Errors are handled only by Error Middleware.

---

# Naming Convention

Modules

authentication.service.js

authentication.repository.js

authentication.controller.js

authentication.endpoints.js

Shared Services

audit.service.js

password.service.js

refresh-token.service.js

session.service.js

DTO

login.dto.js

change-password.dto.js

forgot-password.dto.js

reset-password.dto.js

---

# Business Principles

Single Responsibility Principle

Repositories

↓

Database Operations

Services

↓

Business Logic

Controllers

↓

HTTP Translation

Middleware

↓

Cross-Cutting Concerns

Shared Services

↓

Reusable Business Features

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

API Keys

Organizations

---

# Development Guidelines

Every feature should contain

- DTO
- Repository
- Service
- Controller
- Endpoints

Never skip layers.

Business logic belongs in Services.

Database logic belongs in Repositories.

Validation belongs in DTOs.

HTTP belongs in Controllers.

Cross-cutting concerns belong in Middleware.

This architecture should remain consistent throughout the lifetime of the Identity Provider.