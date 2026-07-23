# Subscription & Payments Architecture (Stripe)

CineVerse provides tiered user access (Free vs. CineVerse Pro) managed via Stripe Checkout and Webhooks.

---

## 💳 Stripe Workflow

1. **Checkout Session**: Users select the Pro tier on `/pricing`, triggering `createCheckoutSession()` server action.
2. **Redirect to Stripe**: User completes payment securely on Stripe-hosted checkout.
3. **Webhook Processing**: Stripe dispatches `customer.subscription.created` to `/api/webhooks/stripe`.
4. **Prisma Update**: The webhook verifies the signature (`STRIPE_WEBHOOK_SECRET`) and updates the `Subscription` status in PostgreSQL.
5. **Entitlement Unlock**: Premium AI recommendation quotas and unlimited watch party creation are unlocked.
