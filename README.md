# Texas Court Intel MVP (5 Counties)

This is a starter website prototype for:
- County dropdown -> court dropdown -> detailed court profile view
- Initial counties: Bexar, Travis, Harris, Hidalgo, Dallas

## Run locally
Option A (quickest):
1. Open PowerShell in this folder
2. Run: `python -m http.server 8080`
3. Visit: `http://localhost:8080`

Option B:
- Use any static server (VSCode Live Server, npm serve, etc.)

## Notes
- Current data is seeded placeholders (`TBD`) to keep within ethical boundaries.
- Only public/official sources should be used.
- Keep source URL + refresh date for every field.

## Next build steps
1. Add a `source_register.csv` with terms-of-use and risk rating by source.
2. Populate judge/coordinator/bailiff from official county pages.
3. Add "last verified" per field, not just per court.
4. Add correction request workflow.
5. Add authentication for private firm notes.
