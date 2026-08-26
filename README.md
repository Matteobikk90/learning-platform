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

## Administrators

An administrator must first complete one magic-link login so the verified user exists. The command uses the `DATABASE_URL` loaded in the current environment, so verify that it targets the intended database. Preview the promotion without changing data:

```bash
pnpm admin:promote --email=admin@example.com
```

Then apply it explicitly:

```bash
pnpm admin:promote:apply --email=admin@example.com
```

Repeat the two commands for every administrator. Existing administrators are never replaced or demoted, and running the command again for the same address is safe.

## Continuous integration

GitHub Actions runs `pnpm check` for pull requests and for pushes to `dev` and
`main`. The workflow installs the locked dependency graph and builds with
non-sensitive placeholder values; it never receives production credentials or
applies database migrations.

Validate an environment containing the production values explicitly with:

```bash
pnpm env:check
```

## Webhooks

Configure these public endpoints in the matching service environment:

- Mux: `/api/mux/webhook`
- Stripe: `/api/stripe/webhook`

Set `MUX_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` to the signing secrets for those exact endpoints. For Mux, enable direct-upload and asset lifecycle events, including ready, errored, and cancelled events.
For Stripe, enable `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`, plus `charge.refunded`, `refund.created`, and `refund.updated`. Checkout lifecycle events keep each purchase attempt idempotent, while full refunds revoke course access and partial refunds remain visible without revoking it.

Deploy the checkout-attempt migration before enabling Stripe live mode. When upgrading an installation that already accepts live payments, first let every Checkout Session created by the previous version complete or expire and confirm that no legacy session remains open before enabling the new checkout flow.

## Health check

`GET /api/health` returns `200` only when the application can reach its database. It returns `503` without infrastructure details when the database is unavailable. The response is never cached and can be used by an external uptime monitor.

## Database migrations

Vercel Production builds validate `DIRECT_URL`, generate Prisma Client, build Next.js, and then run `prisma migrate deploy` before the deployment can become active. A failed application build never touches the production database, while a failed migration prevents the new deployment from being published. Local and Preview builds never apply migrations automatically. Keep every production migration backward compatible with the currently deployed application because the previous deployment can remain active while the migration is running.

## Legal content

The pages under `/[locale]/legal` are operational drafts and are excluded from search indexing. Before production, replace the placeholder seller, privacy, support, jurisdiction, and retention details with professionally reviewed copy. Bump `LEGAL_DOCUMENT_VERSION` whenever accepted legal wording changes so each purchase keeps the exact accepted version.

## Production deployment

Before releasing a new version:

1. Configure all variables from `.env.example` in the production environment.
2. During pre-launch, `EMAIL_FROM` can use `Umberto Iglina <onboarding@resend.dev>`, which delivers only to the Resend account owner. Before launch, replace it with an address on a verified sending domain.
3. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the exact production HTTPS origin; never use localhost in a deployed environment.
4. Run `pnpm env:check` in an environment loaded with the production values; Vercel production builds also run this validation automatically.
5. Run `pnpm videos:sign` against production. If the dry run finds public playback IDs, review them, run `pnpm videos:sign:apply`, and repeat the dry run until none remain.
6. Review every committed migration for backward compatibility.
7. Run `pnpm check`.
8. Replace and approve all draft legal content, then bump its document version.
9. Deploy to Vercel Production and confirm that the build applied all pending migrations.
10. Verify `/api/health`, one magic-link login to an external inbox, one Mux upload through playback, one Stripe test purchase with confirmation email, and one eligible withdrawal/refund using production webhook URLs with test-mode credentials before enabling live payments.

Never commit `.env` files or service credentials.
