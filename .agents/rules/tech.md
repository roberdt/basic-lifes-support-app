---
trigger: model_decision
description: Tech stack versions, Firebase configuration, environment variables, and Maven/npm build commands.
---

# Tech Stack & Environment (`tech.md`)

## Backend (`blsscheduler`)
- **Language & Framework**: Java, Spring Boot, Maven (`./mvnw spring-boot:run`)
- **Database & Auth**: Firebase Admin SDK (Firestore & Firebase Auth token verification)
- **Config**: `src/main/resources/application.yaml`

## Frontend (`basic-lifes-support-app`)
- **Framework**: Next.js (App Router), TypeScript (`npm run dev`, `npm run build`)
- **Database & Auth**: Firebase Client SDK (`lib/`)
- **Styling & Hosting**: `theme.ts`, Google Cloud App Engine (`app.yaml`)