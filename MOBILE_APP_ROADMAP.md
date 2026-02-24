# Texas Court Intel LLC — Mobile App Roadmap (Parallel Track)

## Objective
Stand up a mobile app framework in parallel with web scale-up so we can confidently answer: "Yes, we have an app (beta)."

## Recommended Stack
- React Native + Expo (fastest path to iOS beta)
- Shared API from current backend (`https://api.texascourtintel.com/api`)
- Auth reuse from existing login model
- Push notifications via Expo Notifications (phase 2)

## Phases

### Phase A (Now, 1-2 weeks)
- App shell + branding
- Auth login/logout
- County list + court list + court detail
- Live ticker feed (statewide)
- Save favorite courts locally

### Phase B (2-4 weeks)
- Premium report draft view (read/copy)
- Verification status surface
- Push alerts (news + stale review reminders)
- Offline cache for last-viewed courts

### Phase C (4-8 weeks)
- In-app subscription entitlements
- Attorney verification submission flow
- Better search/filter UX and notification preferences

## iOS Launch Path
1. Purchase Apple Developer Program
2. Create app record in App Store Connect
3. Configure bundle ID + signing
4. Build internal TestFlight beta
5. Invite private testers (attorneys)
6. Collect feedback + harden onboarding

## MVP Feature Set for TestFlight
- Login
- County/court browse
- Court profile and links
- Texas legal ticker
- Basic settings

## Guardrails
- Keep business logic in backend API, not mobile client
- Keep premium gating server-driven
- Reuse existing disclaimer language and verification policy

## Dependencies
- Stable auth endpoints
- Verification status endpoint (`/auth/me`)
- CORS/headers compatible with mobile requests
- Analytics events for onboarding funnel
