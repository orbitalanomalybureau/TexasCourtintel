# County Verification Tracker (Official-Source Pass)

Last updated: 2026-02-27

> Machine-readable tracker now lives at `backend/data/county_verification_tracker.json`.
> Use `backend/COUNTY_VERIFICATION_WORKFLOW.md` for update steps + confidence rules.

## Bexar County
- Status: IN PROGRESS (PARTIAL VERIFIED)
- Courts seeded: Civil District + County Courts at Law
- Official source validation:
  - Court roster URLs: PARTIAL (37th/45th/57th direct court pages linked)
  - Judge names: PARTIAL (57th verified: Judge Antonia (Toni) Arteaga)
  - Coordinators/Bailiffs: PARTIAL (still sparse on extractable page content)
  - Local rules URL: NEEDS URL CORRECTION (existing path returns 404)
  - Holiday calendar URL: PENDING precise page URL
- Notes: 57th court location/phone and judge confirmed from official Bexar court page; remaining courts still queued.

## Harris County
- Status: IN PROGRESS (EXPANDED FOR DEMO)
- Courts seeded: Expanded civil district roster + County Civil Courts at Law
- Official source validation:
  - 55th District Court judge resolved from official Justex API roster endpoint: `https://www.fdams.justex.net/JustexAPI/api/Courts/?CourtClassID=1` (Judge Latosha Lewis Payne, floor/phone included).
  - CCL 1-4 judge/staff fields remain verified from official CCL pages.
  - Additional district courts seeded using official Harris civil courts directory anchor: `https://www.justex.net/Courts/Civil`.
  - Remaining gap: most newly added courts still need per-court judge/coordinator/bailiff verification; 55th coordinator/bailiff remains unresolved.
  - Dropbox/eFiling notes now included at court level as verification prompts; official per-court filing instructions still being validated.

## Dallas County
- Status: IN PROGRESS (EXPANDED FOR DEMO)
- Courts seeded: Expanded civil district roster + County Courts at Law
- Official source validation:
  - 44th Civil District Court judge/staff fields sourced from official Dallas County court page: `https://www.dallascounty.org/government/courts/civil_district/44th/`
  - County Courts at Law 1-5 judge/staff fields sourced from official Dallas County pages (`/law1/` ... `/law5/`): `https://www.dallascounty.org/government/courts/county_court_at_law/`
  - Additional district courts were seeded for demo completeness using official county court directory anchor: `https://www.dallascounty.org/government/courts/`
  - Dropbox/eFiling notes now included at court level as verification prompts; official per-court filing instructions still being validated.

## Travis County
- Status: IN PROGRESS (EXPANDED FOR DEMO)
- Courts seeded: Expanded district roster + County Courts at Law starter set
- Official source validation: 53rd Civil District Court + County Courts at Law 1 & 2 judge/staff/location fields updated from official Travis County court pages.
- Additional district courts seeded from county courts index (`https://www.traviscountytx.gov/courts`) pending per-court judge/staff verification.
- Dropbox/eFiling notes now included at court level as verification prompts; official per-court filing instructions still being validated.

## Hidalgo County
- Status: IN PROGRESS (EXPANDED FOR DEMO)
- Courts seeded: Expanded district roster + County Courts at Law
- Official source validation: 92nd District Court page linked and judge verified (Judge Luis M. Singleterry); remaining courts pending due JS-heavy page extraction.
- Additional district courts seeded from county directory anchor (`https://www.hidalgocounty.us/Directory.aspx?did=18`) pending per-court official page verification.
- Dropbox/eFiling notes now included at court level as verification prompts; official per-court filing instructions still being validated.

## Verification Rules
1. No judge/staff overwrite without an official source URL.
2. Update `lastReviewed` for each court touched.
3. Keep election percentages labeled as benchmark snapshots (cycle-specific).
4. Prefer county/court official pages over third-party summaries.
5. Approved state-level supplemental source: `topics.txcourts.gov` (policy/procedure + statewide court context), but not as sole authority for county judge/staff fields where direct county pages exist.
