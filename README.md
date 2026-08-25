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
- Versioned checkout consent for immediate digital access and withdrawal waiver
- Transactional purchase confirmation and authenticated online withdrawal flow
- Purchased-course area under `/profile`
- Monotonic learner progress, 90% completion, and 10-day module unlocks

## Local setup

1. Copy `.env.example` to `.env` and configure each service.
2. Install dependencies with `pnpm install`.
3. Apply migrations with `pnpm db:deploy`.
4. Start the app with `pnpm dev --port 3001`.

Run the complete local verification with:

```bash
pnpm check
```

Validate an environment containing the production values explicitly with:

```bash
pnpm env:check
```

## Webhooks

Configure these public endpoints in the matching service environment:

- Mux: `/api/mux/webhook`
- Stripe: `/api/stripe/webhook`

Set `MUX_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` to the signing secrets for those exact endpoints. For Mux, enable direct-upload and asset lifecycle events, including ready, errored, and cancelled events.
For Stripe, enable checkout completion events plus `charge.refunded`, `refund.created`, and `refund.updated` so full refunds revoke course access and partial refunds remain visible without revoking it.

## Health check

`GET /api/health` returns `200` only when the application can reach its database. It returns `503` without infrastructure details when the database is unavailable. The response is never cached and can be used by an external uptime monitor.

## Database migrations

Vercel Production builds validate `DIRECT_URL`, generate Prisma Client, build Next.js, and then run `prisma migrate deploy` before the deployment can become active. A failed application build never touches the production database, while a failed migration prevents the new deployment from being published. Local and Preview builds never apply migrations automatically. Keep every production migration backward compatible with the currently deployed application because the previous deployment can remain active while the migration is running.

## Legal content

The pages under `/[locale]/legal` are operational drafts and are excluded from search indexing. Before production, replace the placeholder seller, privacy, support, jurisdiction, and retention details with professionally reviewed copy. Bump `LEGAL_DOCUMENT_VERSION` whenever accepted legal wording changes so each purchase keeps the exact accepted version.

## Production deployment

Before releasing a new version:

1. Configure all variables from `.env.example` in the production environment.
2. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the exact production HTTPS origin; never use localhost in a deployed environment.
3. Run `pnpm env:check` in an environment loaded with the production values; Vercel production builds also run this validation automatically.
4. Review every committed migration for backward compatibility.
5. Run `pnpm check`.
6. Replace and approve all draft legal content, then bump its document version.
7. Deploy to Vercel Production and confirm that the build applied all pending migrations.
8. Verify `/api/health`, one magic-link login, one Mux upload through playback, one Stripe test purchase with confirmation email, and one eligible withdrawal/refund using production webhook URLs with test-mode credentials before enabling live payments.

Never commit `.env` files or service credentials.
