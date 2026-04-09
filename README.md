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

## Build and Run Production

```bash
npm run build
npm run start
```

## Project Structure

- `pages/index.js` - main page
- `pages/api/hello.js` - sample API endpoint
- `app.yaml` - Google App Engine (Flexible) deployment config

## Deploy (App Engine Flexible)

If you deploy to Google App Engine Flexible, use the existing `app.yaml` and deploy with gcloud.

```bash
gcloud app deploy
```
