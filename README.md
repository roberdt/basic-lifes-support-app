# Basic Life Support App

This is a simple [Next.js](https://nextjs.org/) app using the Pages Router.

## Requirements

- Node.js `24.x`
- npm `>=10`

For Vercel deployments, set the Project Settings Node.js Version to `24.x` to match this repo.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Access Request Email Setup

The registration form (`/register`) sends an access request email to an administrator using SMTP.

1. Copy `.env.example` to `.env.local`
2. Fill in your SMTP and admin values

Required environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_EMAIL`

Optional:

- `FROM_EMAIL`

## Build and Run Production

```bash
npm run build
npm run start
```

## Type Checking

```bash
npm run typecheck
```

## Project Structure

- `pages/index.tsx` - main page
- `pages/_app.tsx` - global Material UI theme provider
- `pages/login.tsx` - login screen UI
- `pages/register.tsx` - registration/access-request form
- `pages/calendar.tsx` - full-page monthly calendar with month/year navigation
- `pages/api/hello.ts` - sample API endpoint
- `pages/api/request-calendar-access.ts` - sends access request email to admin
- `pages/api/router/[...route].ts` - lightweight dynamic API router (health, echo, calendar)
- `theme.ts` - shared blue Material UI theme
- `tsconfig.json` - TypeScript compiler settings
- `.env.example` - sample SMTP/admin email configuration
- `app.yaml` - Google App Engine (Flexible) deployment config

## Deploy (App Engine Flexible)

If you deploy to Google App Engine Flexible, use the existing `app.yaml` and deploy with gcloud.

```bash
gcloud app deploy
```

## API Router Examples

The dynamic API router lives at `pages/api/router/[...route].ts`.

- `GET /api/router/health`
- `POST /api/router/echo`
- `GET /api/router/calendar/2026/6`

