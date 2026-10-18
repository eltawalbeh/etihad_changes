# Al-Etihad Tours — consolidated QA remediation

Isolated source-derived development bundle for Phases 1, 2 and 3.

- **Original:** https://github.com/eltawalbeh/Etihadtourswebsite (unchanged)
- **This working repository:** https://github.com/eltawalbeh/etihad_changes
- **Production deployment:** not performed; live site and Supabase were not changed.

## Delivered improvements

- Corrected neutral institutional narrative and legal name (Arabic), removed unverified founding dates and marketing statistics.
- Reviewable, bilingual team records: Abdullah Al Tawalbeh (General Manager), Nabeel Ahmad and Farhan Ishaq (Ticketing Officers); stock photos removed and initials used until approved photos are available.
- Arar address and user-provided Google Maps link; Riyadh/Arar displayed as neutral company locations, not unsupported branch classifications.
- Safe non-destructive initial data; no mock-team fallback; unreviewed sample packages excluded from public listings.
- Real inquiry submissions (contact, service, booking request) stored server-side in Supabase KV, only displaying success after the API responds; admin inbox under **/admin/inquiries**. Sending an inquiry **does not create a confirmed reservation**.
- Team publication approval status and superadmin authorization.
- Fixed duplicated tracking tags; GA4/GTM now loads only after cookie consent. Clarity is intentionally disabled until a consent-aware integration is approved.
- Page metadata, sitemap, descriptive alt text, legal routes and QA test/CI configuration.
- Search tabs without a working API are hidden.

## Production release blockers

1. Confirm legal corporate structure, Riyadh's official address, and any site-wide landline or separate office phone.
2. Confirm the English legal name/spelling and review staff names, positions and photographs; only names and roles submitted in the brief are seeded.
3. Verify historical experience, customer counts, package inventory/pricing, license wording and legal policy texts. Statistics remain hidden until verified.
4. Verify the Supabase Edge function is deployed and that service-role DB policies protect inquiries. Inquiries are stored but there is no automated email notification and no retention-scheduler configured. Assign an operator to check the inbox.
5. Review pre-existing records in the live database (legacy sample packages/articles/team). Code filters known unreviewed package slugs but it does **not** delete data.
6. Publish legally approved privacy/terms pages; current pages are labeled drafts and deliberately marked noindex.
7. CI build and source checks must pass, then run authenticated functional tests, real email/WhatsApp handoff, accessibility, mobile/browser, Lighthouse, and live domain SEO inspections before publication.
8. Original binary images were not transferable over the connected GitHub text-only interface; see ASSET_MIGRATION.md. No binary assets from the original project were silently faked.

## Local QA

```sh
npm install --legacy-peer-deps
npm run qa
npm run build
```

## Architecture

React + Vite frontend, Hono/Supabase Edge API, Supabase KV.
Admin access protected by Supabase authentication and role checks. Inquiries hold customer personal data; do not expose its endpoint or service-role keys directly from the browser.

## Rollout

Treat this repository as a development candidate only. Do not sync it back to Figma Make or deploy live until release blockers are closed and the platform source of truth is identified.
