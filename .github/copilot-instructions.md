# Copilot Instructions for backend-circuito-br-116

## Project Overview
- **Framework:** NestJS (TypeScript)
- **Purpose:** Backend API for the Circuito Br 116 website, replacing legacy infrastructure and modernizing the platform.
- **Architecture:** Modular, with clear separation of concerns (see `src/app/`, `src/common/`, `src/errors/`, `src/filters/`).

## Key Workflows
- **Install dependencies:** `npm install` or `yarn install`
- **Development server:** `npm run start:dev` or `yarn start:dev`
- **Production build:** `npm run build` + `npm run start:prod`
- **Unit tests:** `npm run test`
- **E2E tests:** `npm run test:e2e` (uses `jest-e2e.config.js`)
- **Coverage:** `npm run test:cov` (output in `coverage/`)

## Code Structure & Patterns
- **Entry point:** `src/main.ts` (bootstraps NestJS app)
- **Root module:** `src/app.module.ts`
- **Domain logic:** `src/app/` (main business logic)
- **Common utilities:** `src/common/`
- **Error handling:**
  - Custom errors in `src/common/errors/` (e.g., `not-found.error.ts`, `internal-server.error.ts`)
  - Global exception filter in `src/common/filters/http-exception.filter.ts`
- **Testing:**
  - Tests in `test/` directory
  - E2E config in `jest-e2e.config.js`

## Conventions & Integration
- **SOLID principles:** Maintain separation of concerns and single responsibility in services/controllers.
- **Error handling:** Use custom error classes and the global exception filter for consistent API responses.
- **Environment:** Copy `env.example` to `.env` and configure before running.
- **API docs:** See `swagger.json` for OpenAPI spec.
- **TypeScript config:** `tsconfig.json` and `tsconfig.build.json` for build and IDE support.

## External Dependencies
- **NestJS** (core framework)
- **Jest** (testing)
- **Istanbul** (coverage)
- **Swagger** (API documentation)

## Examples
- To add a new error type, create a file in `src/common/errors/` and update the exception filter if needed.
- To add a new API endpoint, update the relevant module in `src/app/` and ensure tests are added in `test/`.

---

**For AI agents:**
- Always follow existing patterns for error handling and modularization.
- Reference `README.md` for setup and workflow commands.
- Prefer TypeScript best practices and NestJS conventions.
- When in doubt, review `src/app.module.ts` and `src/main.ts` for application structure.
