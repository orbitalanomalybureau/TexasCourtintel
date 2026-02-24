# Texas Court Intel LLC — Trade Secret Inventory (Draft Filled)

> Internal Use Only — Confidential / Trade Secret
> Draft date: 2026-02-24

## 1) Trade Secret Asset Register

| Asset ID | Asset Name | Description | Business Value | Owner | Storage Location | Access Group | Protection Controls | Last Review |
|---|---|---|---|---|---|---|---|---|
| TS-001 | Core Source Code (Web App + API) | Frontend/backend code, routing, business logic | High | Texas Court Intel LLC | GitHub: orbitalanomalybureau/TexasCourtintel | Founder/Admin + approved engineers | Private repo, least privilege, branch commits, backup mirror to ArmorATD | 2026-02-24 |
| TS-002 | Premium Carrier Report Logic | Copy-ready insurer reporting templates, section generators | High | Texas Court Intel LLC | `app.js` + related frontend modules | Founder/Admin + approved engineers | Role gating + verification workflow + review logs | 2026-02-24 |
| TS-003 | Verification / Gating Workflow | Attorney verification process, premium gating design | High | Texas Court Intel LLC | Backend auth/router/schema/model files | Founder/Admin | Admin-only review endpoints, audit trail in repo history | 2026-02-24 |
| TS-004 | County/Court Data Curation Methods | Sourcing, validation, last-reviewed governance workflow | High | Texas Court Intel LLC | `data/courts.json` + rollout docs | Founder/Admin + approved data contributors | Official-source-only policy, `lastReviewed`, tracker docs | 2026-02-24 |
| TS-005 | Deployment + Ops Configuration | Render/Godaddy deployment procedures, operational runbooks | Medium/High | Texas Court Intel LLC | Deployment docs/config files | Founder/Admin | Restricted docs, backup copies, environment separation | 2026-02-24 |
| TS-006 | Strategic Roadmap / Monetization | Tier model, premium feature roadmap, GTM notes | High | Texas Court Intel LLC | Internal memory/docs | Founder/Admin | Confidential handling, limited sharing, no public posting | 2026-02-24 |

## 2) Secrecy Designation Rules
- Mark sensitive docs/code comments where relevant as: **CONFIDENTIAL — TRADE SECRET (Texas Court Intel LLC)**.
- Share only on need-to-know basis.
- Do not post architecture internals, premium logic, or roadmap details publicly.

## 3) Access Control Matrix (Current)

| Role | Repo Access | Prod App/API | Backup Drive (ArmorATD) | Billing/Payments | Legal Docs |
|---|---|---|---|---|---|
| Founder/Admin (Scott) | Full | Full | Full | Full | Full |
| Agent/Automation | Scoped operational access | Operational tasks only | Scripted write to backup path | No direct billing changes without instruction | Drafting support |
| Future Engineer | Ticket-scoped | Limited by role | No default | No default | As required |
| Future Contractor | Task-scoped | None by default | None by default | None | NDA/IP-required |

## 4) Protection Evidence Checklist (Current Snapshot)
- [x] Private codebase with controlled change history
- [x] Regular backup to removable ArmorATD drive
- [x] Handoff continuity docs maintained
- [x] Official-source data integrity policy defined
- [ ] Signed contractor NDA/IP assignment packet in place for all contributors
- [ ] Formal user-access review cadence documented monthly
- [ ] Secrets inventory and key-rotation log consolidated

## 5) Incident & Disclosure Log

| Date | Incident | Systems Affected | Containment | Counsel Notified | Follow-up |
|---|---|---|---|---|---|
| 2026-02-24 | None recorded at draft creation | N/A | N/A | N/A | Begin formal incident register from this date forward |

## 6) Review Cadence
- Monthly: update inventory + access matrix.
- Quarterly: legal/security review.
- Immediate update: after major architecture, data-pipeline, or vendor-access changes.
