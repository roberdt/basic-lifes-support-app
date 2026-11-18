# Project Context — Basic Life Support (BLS) Scheduler

## 1. Mandatory Local File Inspection Rules
- **Always read local files first**: Before generating code, answering architecture questions, or proposing changes, inspect the actual local files in this workspace (`src/`, `app/`, `services/`, `types/`, `pom.xml`, `package.json`, `application.yaml`).
- **Verify Firebase & API contracts**: Never guess Firestore/Firebase collection paths, document fields, DTO shapes, or REST endpoints—verify them directly from the local codebase.
- **Keep documentation synced**: Whenever adding new modules, Firebase collections, or endpoints, update this file or `.agents/rules/` accordingly.

---

## 2. System Overview & Tech Stack
This application is a full-stack Basic Life Support (BLS) Scheduler backed by **Firebase** (Database & Authentication):
- **Backend (`blsscheduler/`)**: Java Spring Boot REST API (`info.safetynetaccess.blsscheduler`), built with Maven (`pom.xml`), using Firebase Admin SDK / Firestore and Spring Security.
- **Frontend (`basic-lifes-support-app/`)**: Next.js (App Router) TypeScript web application (`tsconfig.json`), using Firebase Client SDK and centralized styling (`theme.ts`).

---

## 3. Core Architectural Rules
- **Backend Layering**: Keep `@RestController` classes in `controller/` thin. Place business logic in `service/`, Firebase/Firestore data access in `repository/`, and auth verification in `security/` and `filter/`. Never expose raw `entity/` or `model/` classes directly—map through `dto/`.
- **Frontend Layering**: Keep `app/` routes focused on routing and layout. Centralize all REST API calls to `blsscheduler` inside `services/` (never call `fetch` directly inside UI components). Share TypeScript interfaces matching backend DTOs in `types/`, manage auth/global state in `context/`, and use `theme.ts` for styling.
- **Environment & Secrets**: Never hardcode Firebase credentials, API keys, or service account secrets. Use `application.yaml` / environment variables on the backend and `NEXT_PUBLIC_*` variables (documented in `.env.example`) on the frontend.

---

## 4. Modular Workspace Rules
Detailed directory trees and stack-specific conventions are maintained in `.agents/rules/`:
- `.agents/rules/backend-structure.md` — Spring Boot & Firebase backend layout
- `.agents/rules/frontend-structure.md` — Next.js & Firebase frontend layout