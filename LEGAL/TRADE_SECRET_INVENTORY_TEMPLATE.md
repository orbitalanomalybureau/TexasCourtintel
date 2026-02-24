# Texas Court Intel LLC — Trade Secret Inventory (Template)

> Internal Use Only — Confidential / Trade Secret

## 1) Trade Secret Asset Register

| Asset ID | Asset Name | Description | Business Value | Owner | Storage Location | Access Group | Protection Controls | Last Review |
|---|---|---|---|---|---|---|---|---|
| TS-001 | Source Code (Core App) | Frontend/backend codebase and deployment logic | High | CTO/Founder | Private GitHub repo | Engineering/Admin | Private repo, 2FA, branch protection | YYYY-MM-DD |
| TS-002 | Ranking/Filtering Logic | News ranking heuristics, premium report logic | High | Product | app.js/backend routers | Engineering | Least privilege, code review | YYYY-MM-DD |
| TS-003 | Internal Prompts/Workflows | Agent prompts and operational playbooks | Medium/High | Ops | Workspace/docs | Founder/Ops | Access logs, NDA coverage | YYYY-MM-DD |
| TS-004 | Customer/Usage Data | Subscriber metadata, usage patterns | High | Operations | DB/backups | Admin only | Encryption at rest, access logs | YYYY-MM-DD |

## 2) Secrecy Designation Rules
- Mark all protected files/documents: **CONFIDENTIAL — TRADE SECRET (Texas Court Intel LLC)**.
- Restrict sharing to need-to-know only.
- Never post protected architecture/code snippets in public forums.

## 3) Access Control Matrix

| Role | Repos | Production | Backups | Billing | Legal Docs |
|---|---|---|---|---|---|
| Founder/Admin | Full | Full | Full | Full | Full |
| Engineer | Assigned only | Limited | None unless approved | None | Limited |
| Contractor | Ticket-scoped | None by default | None | None | NDA-only |

## 4) Protection Evidence Checklist
- [ ] NDAs signed (employees/contractors/vendors)
- [ ] IP assignment/work-for-hire signed
- [ ] 2FA enforced for code hosting + infra
- [ ] Secrets manager in use; no plaintext creds in repo
- [ ] Access logs retained
- [ ] Offboarding revocation SOP followed
- [ ] Backup logs retained (ArmorATD + cloud)

## 5) Incident & Disclosure Log

| Date | Incident | Systems Affected | Containment | Counsel Notified | Follow-up |
|---|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  |  |

## 6) Review Cadence
- Monthly update of inventory and access matrix
- Quarterly legal + security review
- Immediate update after major architecture/data pipeline changes
