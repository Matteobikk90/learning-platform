// Browser events are proxied through this same-origin path so the CSP stays
// unchanged and ad blockers cannot drop them. proxy.ts must skip it.
export const SENTRY_TUNNEL_ROUTE = "/monitoring";
