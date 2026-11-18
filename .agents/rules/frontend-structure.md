# Frontend Project Architecture & Structure (`basic-lifes-support-app`)

This document outlines the directory layout, architectural conventions, and AI agent guidelines for the **Basic Life Support (BLS) Scheduler** frontend application.

---

## 1. Overview & Tech Stack

- **Project Name**: `basic-lifes-support-app`
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (`tsconfig.json`)
- **Styling / Theming**: Centralized theme tokens (`theme.ts`)
- **Deployment Target**: Google Cloud App Engine (`app.yaml`)
- **Backend Integration**: Consumes REST APIs exposed by the Spring Boot `blsscheduler` service.

---

## 2. Directory Structure

```text
basic-lifes-support-app/
├── .agents/                    # AI agent guidelines, coding standards, and architectural rules
│   └── rules/
│       ├── backend-structure.md  # Spring Boot & Firebase backend architecture reference
│       ├── coding-standards.md   # Backend and frontend coding and formatting standards
│       ├── frontend-structure.md # Complete Next.js frontend directory structure and rules
│       └── tech.md               # Tech stack versions, build commands, and Firebase configuration
├── .idea/                      # JetBrains IDE workspace configuration
├── .next/                      # Next.js build output & cache (gitignored)
├── app/                        # Next.js App Router (pages, layouts, loading/error states, route handlers)
│   ├── about/
│   │   └── page.tsx            # Informational About page
│   ├── api/                    # Server-side API route handlers
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts    # Authentication and session login route handler
│   │   ├── companies/
│   │   │   ├── [id]/
│   │   │   │   ├── all-classes/
│   │   │   │   │   └── route.ts # Fetch all classes for a company
│   │   │   │   ├── approval/
│   │   │   │   │   └── route.ts # Company approval route handler
│   │   │   │   ├── classes/
│   │   │   │   │   ├── [classId]/
│   │   │   │   │   │   ├── classslots/
│   │   │   │   │   │   │   └── route.ts # Class slot management route handler
│   │   │   │   │   │   ├── slots/
│   │   │   │   │   │   │   └── route.ts # Class slot availability route handler
│   │   │   │   │   │   └── route.ts     # Specific class operations route handler
│   │   │   │   ├── courses/
│   │   │   │   │   ├── [courseId]/
│   │   │   │   │   │   └── route.ts # Specific course operations route handler
│   │   │   │   │   └── route.ts     # Company courses collection route handler
│   │   │   │   ├── dates/
│   │   │   │   │   ├── [dateId]/
│   │   │   │   │   │   ├── times/
│   │   │   │   │   │   │   ├── [timeId]/
│   │   │   │   │   │   │   │   ├── classslots/
│   │   │   │   │   │   │   │   │   ├── add/
│   │   │   │   │   │   │   │   │   │   └── route.ts # Add class slot
│   │   │   │   │   │   │   │   │   ├── delete/
│   │   │   │   │   │   │   │   │   │   └── route.ts # Delete class slot
│   │   │   │   │   │   │   │   │   ├── update/
│   │   │   │   │   │   │   │   │   │   └── route.ts # Update class slot
│   │   │   │   │   │   │   │   │   └── route.ts     # Time class slots route handler
│   │   │   │   │   │   │   │   ├── slots/
│   │   │   │   │   │   │   │   │   └── route.ts     # Time slots route handler
│   │   │   │   │   │   │   │   └── route.ts         # Specific time operations route handler
│   │   │   │   │   │   │   └── route.ts             # Date times collection route handler
│   │   │   │   │   │   └── route.ts                 # Specific date operations route handler
│   │   │   │   │   └── route.ts                     # Company dates collection route handler
│   │   │   │   ├── instructors/
│   │   │   │   │   ├── [instructorId]/
│   │   │   │   │   │   └── route.ts # Specific instructor operations route handler
│   │   │   │   │   └── route.ts     # Company instructors collection route handler
│   │   │   │   └── users/
│   │   │   │       ├── [userId]/
│   │   │   │       │   └── route.ts # Specific user operations route handler
│   │   │   │       └── route.ts     # Company users collection route handler
│   │   │   └── route.ts        # Companies collection route handler
│   │   ├── register/
│   │   │   └── route.ts        # User registration route handler
│   │   └── request-calendar-access/
│   │       └── route.ts        # SMTP calendar access request email route handler
│   ├── calendar/
│   │   ├── loading.tsx         # Calendar loading skeleton
│   │   └── page.tsx            # Full-page monthly schedule calendar view
│   ├── classes/
│   │   ├── create/
│   │   │   └── page.tsx        # Class creation form page
│   │   ├── slots/
│   │   │   └── page.tsx        # Class slot scheduling page
│   │   └── page.tsx            # Classes list and overview page
│   ├── companies/
│   │   └── page.tsx            # Companies list and management page
│   ├── courses/
│   │   └── page.tsx            # Courses catalogue page
│   ├── instructors/
│   │   └── page.tsx            # Instructors management page
│   ├── login/
│   │   ├── loading.tsx         # Login loading state
│   │   └── page.tsx            # User login view
│   ├── register/
│   │   ├── loading.tsx         # Registration loading state
│   │   └── page.tsx            # Access request and registration form page
│   ├── users/
│   │   └── page.tsx            # Users administration page
│   ├── globals.css             # Global CSS styling
│   ├── layout.tsx              # Root Next.js App Router layout
│   ├── loading.tsx             # Root loading fallback
│   ├── page.tsx                # Application home / dashboard landing page
│   └── providers.tsx           # Global context providers (MUI theme, auth, message)
├── components/                 # Reusable, modular UI components
│   ├── loading/
│   │   └── BouncingBalls.tsx   # Loading spinner animation component
│   ├── nav/
│   │   └── pfapmenulist.tsx    # Navigation menu items component
│   ├── Dashboard.tsx           # Dashboard view component
│   ├── pfapappbar.tsx          # Top application navigation bar
│   ├── pfapcontainer.tsx       # Standard layout wrapper container
│   ├── pfapfooter.tsx          # Application footer component
│   └── SessionTimeoutModal.tsx # Inactivity warning and session expiry dialog
├── context/                    # React Context providers for global client state
│   ├── AuthContext.tsx         # Auth state, token lifecycle, and session tracking
│   └── MessageContext.tsx      # Global alert / notification snackbar provider
├── lib/                        # Core utilities, HTTP client setup, and helper functions
│   ├── api.js                  # Legacy JavaScript API client helpers
│   ├── api.ts                  # TypeScript Axios/Fetch API client and request helpers
│   └── session.ts              # Client session storage, token expiry, and inactivity timers
├── node_modules/               # Installed npm dependencies (gitignored)
├── public/                     # Static public assets
│   ├── cpr-icon.png            # CPR / BLS logo icon
│   ├── favicon.ico             # Application favicon
│   ├── favicon.ico.old         # Legacy backup favicon
│   ├── google2754b138b936152b.html # Google Search Console site verification
│   └── vercel.svg.old          # Legacy Vercel asset backup
├── services/                   # API service modules for communicating with the `blsscheduler` backend
│   ├── auth.js                 # Legacy authentication service
│   └── auth.ts                 # Authentication service (login, logout, session verification)
├── types/                      # Global TypeScript interfaces, enums, and DTO type definitions
│   ├── css.d.ts                # CSS module type declarations
│   └── global.d.ts             # Global application type declarations
├── .env                        # Local environment variables (gitignored)
├── .env.example                # Template documenting required environment variables
├── .gitignore                  # Git ignore rules
├── .node-version               # Node.js runtime version specification
├── .nvmrc                      # Node Version Manager (nvm) configuration
├── app.yaml                    # Google App Engine deployment configuration
├── basiclifesupport.iml        # IntelliJ/WebStorm module file
├── GEMINI.md                   # AI assistant project context, architectural guidelines, and rule index
├── implementation_plan.md      # Feature roadmap and architectural planning notes
├── next-env.d.ts               # Next.js TypeScript declaration file
├── package.json                # Project dependencies and npm scripts
├── package-lock.json           # Locked dependency tree
├── README.md                   # Setup instructions and project overview
├── theme.js                    # Compiled theme asset
├── theme.ts                    # Centralized UI theme configuration (colors, typography, spacing)
├── tsconfig.json               # TypeScript compiler configuration
├── tsconfig.tsbuildinfo        # TypeScript incremental build cache
└── walkthrough.md              # Developer onboarding and feature walkthrough documentation
```

---

## 3. Architectural Conventions & Agent Rules

When generating or modifying code in `basic-lifes-support-app`, follow these strict rules:

1. **Routing & Pages (`app/`)**:
   - Use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
   - Keep route files lightweight; delegate complex UI rendering to `components/` and data fetching to `services/`.

2. **API Layer (`services/`)**:
   - **Never** make raw `fetch` or HTTP client calls directly inside `app/` pages or `components/`.
   - Encapsulate all communication with the `blsscheduler` backend inside dedicated service modules under `services/`.

3. **Type Safety (`types/`)**:
   - Define strict TypeScript interfaces in `types/` that mirror the backend `dto/` request and response contracts.
   - Avoid using `any`.

4. **State Management (`context/`)**:
   - Use React Context providers in `context/` for cross-cutting concerns (such as authentication tokens, active user profiles, and global notifications).

5. **Styling & Design System (`theme.ts`)**:
   - Adhere to the design tokens, color palette, and typography rules configured in `theme.ts` rather than hardcoding arbitrary values.

6. **Environment Configuration (`.env` / `.env.example`)**:
   - Reference backend base URLs and public keys via environment variables (`NEXT_PUBLIC_*`). Whenever adding a new variable to `.env`, document a placeholder in `.env.example`.