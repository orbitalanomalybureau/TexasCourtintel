# Subscription + Accounts Setup (Texas Court Intel)

## Accounts
- New endpoint added: `POST /api/auth/register`
- Creates `viewer` users by default.

## Billing Endpoints
- `GET /api/billing/plans`
- `GET /api/billing/checkout-links`

## Payment Acceptance (recommended Stripe)
1. Create Stripe Payment Links for Pro and Premium plans.
2. Set backend env vars in Render API service:
   - `PAYMENT_LINK_PRO`
   - `PAYMENT_LINK_PREMIUM`
3. Redeploy API.

## Current Product Tier Intent
- Core: official roster + rules + timestamps
- Pro: advanced briefs + exports
- Premium: carrier report builder + supplemental context layer

## Next Build Items
- Add frontend pricing page consuming `/api/billing/plans`
- Add checkout buttons using `/api/billing/checkout-links`
- Gate premium report panel behind authenticated premium entitlement
- Add webhook endpoint for Stripe to update user subscription status
