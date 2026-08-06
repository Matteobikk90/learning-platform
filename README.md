# Learning Platform

Production-oriented course platform built with Next.js 16, Prisma 7, Supabase Postgres and Storage, NextAuth, Stripe Checkout, and Mux Video.

## Main flows

- Email magic-link authentication with user and admin roles
- Admin CRUD for courses and modules
- Draft/publish workflow that exposes only courses with ready videos
- Permanent protection against deleting published or purchased courses
- Resumable direct video uploads to Mux with verified webhooks
- Automatic video processing status and duration synchronization
- Stripe Checkout with webhook-based, idempotent course fulfillment
- Purchased-course area under `/profile`
- Monotonic learner progress, 90% completion, and 10-day module unlocks

## Local setup

1. Copy `.env.example` to `.env` and configure each service.
2. Install dependencies with `pnpm install`.
3. Apply migrations with `pnpm db:deploy`.
4. Start the app with `pnpm dev -- --port 3001`.

Run the complete local verification with:

```bash
pnpm check
```

## Webhooks

Configure these public endpoints in the matching service environment:

- Mux: `/api/mux/webhook`
- Stripe: `/api/stripe/webhook`

Set `MUX_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` to the signing secrets for those exact endpoints. For Mux, enable direct-upload and asset lifecycle events, including ready, errored, and cancelled events.

## Production deployment

Before releasing a new version:

1. Configure all variables from `.env.example` in the production environment.
2. Set both application URLs to the production HTTPS origin.
3. Run `pnpm db:deploy` against the production database.
4. Run `pnpm check`.
5. Verify one magic-link login, one Mux upload through playback, and one Stripe test purchase using production webhook URLs with test-mode credentials before enabling live payments.

Never commit `.env` files or service credentials.
