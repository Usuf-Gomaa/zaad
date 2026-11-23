# ZAAD | زاد

**An offline-first, bilingual journey companion with reliable local persistence and a gated religious-content review workflow.**

ZAAD helps users organize personal du'as, daily tasks and trip-specific Umrah progress on their own device. A separate editorial workspace supports religious-source research and reviewer feedback before publication.

**Version:** 0.4.0 · **Status:** active development / deployment preparation · **Repository:** [Usuf-Gomaa/zaad](https://github.com/Usuf-Gomaa/zaad)

> All 51 religious records remain pending qualified scholarly review. Public builds exclude unapproved guidance and draft FAQ answers. Source observations, reviewer feedback and qualified approval are separate states. ZAAD is not an approved religious authority or a deployed complete Umrah guide.

## Features

- **Offline-first PWA:** locally bundled Arabic/English UI, fonts and app assets; installation manifests and service-worker precaching for public and trusted local-review builds.
- **Reliable autosave:** debounced personal drafts, serialized database writes, lifecycle flushes, visible save/failure states and retry controls.
- **Personal du'a library:** editable categories, search, pinning, notes, ordering, copying, printing and focused reading.
- **Day planner:** date/time scheduling, categories, editing, completion, reordering and archive/restore.
- **Trip-based Umrah tracking:** six stages with isolated progress per trip and gender-aware views. Tracking does not automatically determine religious validity or penalties.
- **Bilingual UI:** Arabic RTL and English LTR, persistent language selection and exact preservation of user-authored notes and du'as.
- **Data portability:** versioned IndexedDB storage, validated JSON backups and atomic restore with older-backup compatibility.
- **Safe PWA updates:** version/What's New, explicit activation confirmation, pending-write checkpoints, a two-phase worker handshake and multi-window protection.
- **Editorial review:** 34 rite records, 16 FAQ drafts and one supplication candidate, with evidence references, verification gaps, audience labels and historical comparisons.
- **Reviewer feedback:** local per-record notes, optional reviewer-entered name/decision, history and JSON/CSV export. Source-document fingerprints prevent silently reusing feedback decisions on changed source material.
- **Hosting preparation:** separate public and authenticated reviewer artifacts, Caddy security/cache configuration and documented deployment/rollback procedures. No website has been deployed.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, React Router 7 |
| Build | Vite 6, npm, TypeScript compiler |
| UI | Responsive CSS, Lucide React, locally bundled Noto Naskh Arabic |
| Persistence | IndexedDB, Dexie, dexie-react-hooks; JSON backup/restore |
| PWA | vite-plugin-pwa, custom Workbox service worker, Cache Storage, web app manifests |
| Internationalization | Local Arabic/English catalogs, shared message IDs, RTL/LTR direction management |
| Unit/component testing | Vitest, React Testing Library, jest-dom, jsdom, fake-indexeddb |
| Browser testing | Playwright, Chromium, isolated test profiles |
| Hosting preparation | Caddy, HTTPS, HTTP Basic authentication for reviewer staging, CSP and cache policies |
| Engineering | Git, GitHub, npm audit, structured content and build-time publication checks |

No application backend, application accounts, analytics, advertising, subscriptions or remote personal-data synchronization. Reviewer staging authentication is infrastructure access control; feedback remains local.

## Architecture

```text
React UI + Arabic/English catalogs
             |
      serialized save queue
             |
    Dexie / IndexedDB v2 ---- JSON backup / atomic restore

Structured religious drafts ---- private editorial overlay
             |                         |
  strict publication gate        evidence + feedback / export
             |
      public allowlist
      (currently empty)

Public/local PWA: precached assets + explicit safe-update lifecycle
Remote staging: whole-origin authentication + no offline draft worker
```

Application version, content edition and database schema are independent. The user database and backup format remain **v2**; reviewer feedback uses a separate **v1** editorial database. Personal features require no server or account.

## Getting started

### Prerequisites

- Node.js **22.19+** and npm **10+**.
- Git and permission to clone this repository when private.
- Chromium for browser tests; a verified Caddy binary for hosting/staging tests.

```sh
git clone https://github.com/Usuf-Gomaa/zaad.git
cd zaad
npm ci
npm run dev
```

Open the loopback URL printed by Vite. Development mode does not install a service worker. Browser storage is origin-specific: development, preview and an eventual production domain have separate data. No backend secrets are required for local personal features.

### Public production build

```sh
npm run build
npm run preview
```

`dist/` is the public artifact. After initial loading and successful precaching, offline reload is available. External evidence links require internet. Root-path hosting is assumed.

### Trusted local editorial review

```sh
npm run review
```

Open `http://127.0.0.1:4180/review`, read the warning and explicitly enable draft viewing. This builds `.review-dist/` and serves it only on loopback. After first successful caching, local review works offline.

The loopback server and viewing acknowledgement are **not remote authentication**. Do not expose this port or upload the offline artifact to public hosting.

### Authenticated reviewer staging preparation

```sh
npm run staging:build
```

`.staging-dist/` is a separate network-only reviewer artifact with no registered draft worker or installation manifest link. `hosting/Caddyfile` supplies whole-origin authentication, no-store headers and separate public hosting rules. Use a fresh dedicated HTTPS origin that has never installed an offline draft worker.

This command does not deploy. Follow [the staging runbook](docs/REVIEWER_STAGING_DEPLOYMENT.md) and obtain owner authorization before hosting, DNS changes or invitations. Access revocation cannot erase viewed text, local feedback or exports.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Catalog checks, TypeScript compilation and gated public build |
| `npm run preview` | Preview the public artifact locally |
| `npm test` | Unit/component and database compatibility tests |
| `npm run test:e2e` | Build test fixtures and run the browser suite |
| `npm run i18n:check` | Static UI message/catalog coverage |
| `npm run content:status` | Generate content status, evidence matrix and handoff |
| `npm run sources:identity` | Regenerate the combined source-document fingerprint |
| `npm run review:import` | Import the base draft without approving content |
| `npm run review:build` | Build trusted local offline review |
| `npm run review:serve` | Serve the local-review artifact on loopback |
| `npm run staging:build` | Build network-only reviewer staging |
| `npm run publication:check` | Verify IDs, blocked drafts and public exclusion |
| `npm run security:check` | Check host policy and staging artifact safeguards |
| `npm run hosting:test` | Real Caddy authentication/routing/cache tests locally |
| `npm audit` | Audit the npm dependency graph |

Review generator output after changing source inputs. Do not build and test against the same generated artifact concurrently.

## Testing and verification

Latest application validation for 0.4.0:

| Check | Result |
| --- | --- |
| Public, local-review and authenticated-staging builds | Passed |
| Unit/component tests | **39 passed** across nine files |
| Playwright browser tests | **10 passed** |
| Real-Caddy loopback hosting scenarios | **20 passed** |
| Content, translation, security and publication checks | Passed |
| npm audit | **0 vulnerabilities** at validation time |

Coverage includes exact drafts while switching language, autosave/error retry, offline hard reload, older backups, trip/checklist isolation, source identity, approval gating, feedback export/history, responsive layouts, authenticated staging and safe worker updates with pending writes/multiple windows.

### Browser and hosting test setup

PowerShell example:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.playwright"
npx playwright install chromium
$env:CADDY_BIN = 'C:\path\to\verified\caddy.exe'
npm run build
npm run staging:build
npm run security:check
npm run hosting:test
npm run test:e2e
```

Use an official Caddy release and verify its publisher checksum. The helper also accepts `.tools/caddy/caddy.exe`. Binaries and downloaded browsers are not committed. Test-only credentials must never be used remotely.

Ports **4173, 4176, 4180, 4280, 4281 and 5175** must be free. Tests use isolated profiles/synthetic databases, not existing user data. Browser pretests generate `.test-release/`, `.review-dist/` and `.staging-dist/`; none is automatically deployed.

These tests do not establish live DNS/TLS, the eventual hosting perimeter, physical iOS/Android behavior, complete assistive-technology coverage or religious correctness. See [the full verification report](docs/PUBLIC_RELEASE_READINESS.md).

## Religious content status

| Area | State |
| --- | --- |
| Stable records | 51: 34 rites, 16 FAQs, one supplication candidate |
| Prepared narrative drafts | 43, unapproved |
| Research briefs | Seven requiring substantive completion |
| Exact supplication insertion | One pending |
| v2.1 source observations | Five partial observations across four pages |
| Complete claim coverage | Not confirmed |
| Qualified scholarly approvals | None |
| Approved English religious translations | None |
| Public normative release | Blocked; public allowlist empty |

Source existence, a checked excerpt, complete claim coverage and qualified approval are distinct. Feedback names or an “agree” decision do not grant approval or publish a ruling. No hadith grades, qualified identities, approval dates or English verification are fabricated.

The complete repository contains unapproved editorial material intended for restricted development/review access. A private repository is separate from the public application gate. A future public source release needs deliberate review of drafts, repository contents and source permissions.

## Privacy and operational limits

- Personal data and reviewer feedback stay in the browser. Exports are local downloads; nothing uploads automatically.
- Wait for Saved and keep backups. Forced termination, storage eviction, uninstall or browser clearing can lose local data.
- Changing domains does not migrate IndexedDB. Export from the old origin and explicitly restore at the new one.
- Updates need a reachable server and an open/running app. No immediate updates are promised while offline or closed.
- Remote staging deliberately avoids offline draft caching; viewed text, exported files and local feedback are not remotely erasable.
- No analytics are included. Future hosting operators still need an operational log-retention/access policy.

## Repository structure

```text
src/
  components/       Shared UI and evidence viewer
  content/          Schemas, stable IDs and publication gate
    review-v2/      Private draft overlay, observations and fingerprints
  db/               Dexie persistence, migrations and backup/restore
  features/         Personal features, FAQ, support and editorial review
  i18n/             Arabic/English catalogs and direction/preferences
  pwa/              Worker, activation protocol and write barriers
  styles/           Responsive visual system
  test/             Component/persistence tests
 e2e/               Playwright scenarios and local fixtures
 scripts/           Build/content/publication/hosting tools
 hosting/           Caddy configuration and environment template
 public/            Icons, license notices and static PWA assets
 docs/              Architecture, evidence, verification and runbooks
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Reviewer handoff](docs/REVIEWER_HANDOFF.md)
- [Evidence matrix](docs/RELIGIOUS_EVIDENCE_MATRIX.md)
- [Content status](docs/RELIGIOUS_CONTENT_STATUS.md)
- [Authenticated reviewer staging](docs/REVIEWER_STAGING_DEPLOYMENT.md)
- [Public release readiness](docs/PUBLIC_RELEASE_READINESS.md)
- [Safe updates and versioning](docs/UPDATES_AND_VERSIONING.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Future Umrah/Hajj updates](docs/POST_LAUNCH_CONTENT_UPDATE_WORKFLOW.md)

## Contributing and next steps

Preserve stable religious IDs, IndexedDB v2 and backup compatibility. Keep religious data outside UI components, provide both UI languages and test pending writes when changing navigation/updates. Never commit personal backups, reviewer exports, credentials, local tools or generated deployment artifacts.

Remaining work includes qualified religious review, independently reviewed English translations, live hosting/device validation and separately reviewed future Hajj content. Hosting is prepared, not deployed. Propose changes through reviewed commits/pull requests and run checks appropriate to each change.

## License

No project-wide open-source license has been selected. Bundled fonts and dependencies retain their own notices; see `public/FONT-LICENSE.txt` and their packages.
