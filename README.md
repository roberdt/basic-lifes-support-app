# Basic Life Support App

This is a simple [Next.js](https://nextjs.org/) app using the App Router.

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

- `app/layout.tsx` - root App Router layout
- `app/providers.tsx` - global Material UI theme, auth, and message providers
- `app/page.tsx` - home page
- `app/login/page.tsx` - login screen UI
- `app/register/page.tsx` - registration/access-request form
- `app/calendar/page.tsx` - full-page monthly calendar with month/year navigation
- `app/about/page.tsx` - informational about page used by the menu
- `app/api/request-calendar-access/route.ts` - sends access request email to admin
- `theme.ts` - shared blue Material UI theme
- `tsconfig.json` - TypeScript compiler settings
- `.env.example` - sample SMTP/admin email configuration
- `app.yaml` - Google App Engine (Flexible) deployment config

## Deploy (App Engine Flexible)

If you deploy to Google App Engine Flexible, use the existing `app.yaml` and deploy with gcloud.

```bash
gcloud app deploy
```

## Notes

- Legacy Pages Router route files were renamed to `*.old` backups under `pages/`.
- The access-request form now posts to the App Router handler at `/api/request-calendar-access`.

