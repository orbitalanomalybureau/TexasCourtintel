# TexasCourtIntel — API Options (Free + Paid)

Date: 2026-02-23

## Quick Note
- The bind error you saw (`port 8010 already in use`) means the backend was already running; not a product logic bug.

## 1) Free / Low-Cost Options

### A) Google News RSS (already implemented)
- Use: real-time headline feed by county/court/judge query
- Cost: free
- Pros: no API key, fast to deploy
- Cons: noisy and not court-specific by default

### B) CourtListener / RECAP APIs
- Use: federal and appellate dockets/opinions coverage
- Cost: free tiers / open access components
- Pros: legal-native data source
- Cons: trial-court coverage varies; Texas county-level granularity may be limited

### C) Official county/court feeds + pages
- Use: local rules, notices, schedules, live stream links
- Cost: free
- Pros: authoritative
- Cons: fragmented and inconsistent formats; higher maintenance

## 2) Paid / Enterprise Options

### A) Trellis API / legal analytics providers
- Use: state trial-court analytics, docket intelligence
- Cost: paid (varies by contract)
- Pros: stronger structured trial-court signals
- Cons: licensing restrictions, cost

### B) DocketAlarm / Fastcase integrations
- Use: docket tracking and legal research workflow
- Cost: paid
- Pros: legal-focused APIs and monitoring tools
- Cons: provider-specific constraints, variable trial-court depth

### C) Lexis / Westlaw / Bloomberg Law data products
- Use: premium legal intelligence and research feeds
- Cost: high (enterprise)
- Pros: high trust + breadth
- Cons: expensive and strict redistribution rules

### D) NewsAPI / GDELT / EventRegistry (news layer)
- Use: broader media intelligence on judges/courts
- Cost: free tiers + paid plans
- Pros: cleaner APIs than RSS, better filtering options
- Cons: still requires legal-specific query tuning

## 3) Recommended Stack for TexasCourtIntel

### Phase 1 (Now)
- Keep Google News RSS endpoint for no-cost real-time context
- Continue official county links for rules/holidays/streams

### Phase 2
- Add one paid legal data provider for structured docket/event intelligence
- Add source confidence score in UI

### Phase 3
- Blend 2+ sources and rank by relevance + trust + freshness

## 4) Compliance Reminder
- For paid APIs, confirm in contract:
  - storage rights
  - derivative analytics rights
  - display/redistribution rights
  - user-facing vs internal-only restrictions

## 5) Immediate Next Integrations (Practical)
1. Add optional NewsAPI/EventRegistry connector for cleaner headline feed.
2. Add provider toggle in admin settings (RSS vs paid feed).
3. Add de-duplication + relevance scoring for judge/court names.
4. Add source attribution and timestamp on every headline card.
