# زاد | ZAAD — Codex Master Implementation Specification
Version: 1.0 • 2026-11-23 • Language: Arabic-first (RTL)

> **Mission:** Build a free, privacy-preserving, offline-first, installable PWA that helps pilgrims plan their day, organize personal du'as, and follow an evidence-linked step-by-step Umrah guide. This is a charitable, noncommercial product. **No login, subscriptions, ads, personal analytics, or remote storage of user notes.**

## 0. Instructions to Codex (read first)

You are the lead full-stack engineer and UX designer. Implement a production-quality MVP in the current repository. Inspect the repository before editing; preserve existing work. Do not ask questions unless blocked by a genuinely necessary decision. Create and maintain `/docs/` documentation. Do not invent religious rulings, hadith references, evidentiary grades, or URLs. Never label unverified content as verified. A polished functional app is preferable to a large but unverified content library. Use Arabic UI copy and accessible RTL layouts. Use real data persistence, not mock persistence. Do not add authentication or analytics SDKs by default. Provide a working build, tests, and deployment instructions.

**Delivery priorities:** (P0) du'a notebook, daily plan, offline operation, reliable autosave, Umrah stage checklist; (P1) sourced rites and FAQ; (P2) richer media, backup UX, optional anonymous aggregate counters; (future) Hajj. The application must remain useful if P1 content is incomplete: do not fabricate it.

## 1. Product identity

- Brand: **زاد** (ZAAD). Working tagline: **زاد المعتمر في رحلته إلى بيت الله الحرام**. Brand and domain availability must be checked before public launch; Saudi Nusuk already uses a service called 'زاد' on its site, so avoid implying official affiliation.
- Purpose: spiritual and practical companion, not an official government app, fatwa service, or permit booking system.
- Audience: any Arabic-speaking pilgrim, men and women, including elderly and low-tech users.
- Scope: Umrah MVP, content architecture extensible to Hajj. Do not ship incomplete Hajj rites as if they are ready.
- Tone: respectful, calm, concise; no gamification of worship or claims about the user's spiritual merit.

## 2. Core navigation and information architecture

Bottom navigation (mobile): **يومي** / **دعواتي** / **مناسك العمرة** / **المزيد**.

### 2.1 Home / يومي (primary)
- Today's date (device-local), editable trip date/time, customizable timeline and tasks.
- Add, edit, reorder, check/uncheck, archive tasks; user-defined categories and optional suggested tasks (packing, travel, ihram, rest, prayer, hydration).
- No compulsory fixed schedule; allow blank plan and flexible start times. Avoid promising live prayer times without a trusted offline dataset/location permissions.
- Display progress separately for **personal tasks** and **ritual steps**; don't confuse recommended actions with obligatory rites.
- Prominent offline and save status; instant access to personal du'as.

### 2.2 دعواتي (highest user value)
- Five seeded, editable categories: (1) لنفسي (2) لأهلي (3) لأصحابي (4) لسائر المسلمين والمسلمات والأمة الإسلامية (5) لأمواتي وأموات المسلمين.
- Unlimited user-created du'as; add/edit/delete, search, pin/favorite, manual sort, optional notes; distinguish **دعاء شخصي** from **دعاء مأثور**.
- Autosave text while typing, including drafts before clicking Save, after reload, and offline. Drafts survive accidental navigation. Debounce ~250–500ms with flush on blur/pagehide where possible; use durable IndexedDB transactions; show 'جارٍ الحفظ' / 'تم الحفظ' / 'تعذر الحفظ'. Never falsely show saved.
- Include curated prophetic supplications ONLY after authentic text/source review; show references and exact wording. No invented ritual-specific du'as per circuit of tawaf or sa'i.
- Support readable fullscreen focus mode, large Arabic type, copy, optional export/print. No forced network calls.

### 2.3 مناسك العمرة
- Stepper and separate progress per stage: (1) الاستعداد والمواقيت (2) الإحرام والتلبية (3) دخول المسجد والطواف (4) بعد الطواف (5) السعي (6) الحلق/التقصير والتحلل.
- Each stage has: overview, step-by-step checklist, rule labels, women/men differences, evidence icon, common mistakes, FAQ, optional locally bundled image with alt text.
- Men/women view: default shared content; selecting women shows only genuine differences as emphasized annotations, not duplicated/contradictory rites. Gender selection is local and optional, never sent to a server.
- Each legal statement opens an **Evidence Sheet**: source type, exact citation, direct link (when online), grade of hadith where established, legal classification, scholarly position, dispute summary when applicable, review status/date. If no reliable source: label 'يحتاج مراجعة علمية' and hide from public normative guidance.
- Differentiate **ركن / واجب / سنة / مستحب / مباح / مكروه / محظور**, and make clear classifications may differ by school. Do not automatically pick 'easiest' or 'strictest' as a universal fatwa.
- If a user reports missing a rite, do not auto-prescribe penalties or invalidate worship. Show sourced general guidance and advise a qualified scholar for individual circumstances.

### 2.4 المزيد
- FAQ, evidence methodology, offline status, settings (text scale, theme), local backup/restore, privacy statement, about, app installation instructions, sources, feedback link (optional, explicit).
- No user account, advertising, third-party behavioral trackers, or content monetization.

## 3. Technical stack and implementation

- React + TypeScript + Vite, React Router, Tailwind CSS (or repo's existing styling), accessible component primitives, Lucide icons.
- PWA: `vite-plugin-pwa` / Workbox, valid manifest, maskable icon, service worker, offline fallback, asset precache. Explicitly cache app shell, all essential guide data, core fonts, icons, and essential images. Avoid runtime dependence on remote font/CDN or external API.
- Local persistence: **IndexedDB via Dexie** (or idb), schema versioned migrations, transaction-safe writes. Never rely on localStorage alone for valuable notes. Optional localStorage only for tiny non-sensitive preferences.
- No backend required for MVP. Deploy static build over HTTPS (e.g. Cloudflare Pages / Netlify / Vercel free tier) after reviewing free-plan limits.
- No auth, no Supabase, no Firebase, no Google Analytics by default.
- Service worker update flow must never erase user IndexedDB. Prompt 'تحديث متاح' and allow safe refresh; ensure offline launch works after a successful initial install/cache.
- iOS limitations: Safari Share > Add to Home Screen; actual PWA behavior, storage persistence, and background lifecycle vary by OS/browser. Inform users about backup; do not guarantee storage survives app removal, browser data deletion, or OS eviction.
- Security: CSP compatible with PWA, avoid dangerous HTML, escape user input, no secret keys in client, no unnecessary permissions, sanitize imported JSON, validate schema, size limits, export/download locally.
- Accessibility: Arabic `lang=ar`, `dir=rtl`, keyboard navigation, visible focus, 44px touch targets, WCAG AA contrast, scalable type, reduced motion, meaningful icons with labels, high legibility in sunlight.

## 4. Local data model (example, adapt as needed)

```ts
type ReviewStatus = 'verified' | 'needs_review' | 'draft';
type RuleClass = 'pillar' | 'obligation' | 'sunnah' | 'recommended' | 'permitted' | 'disliked' | 'prohibited' | 'disputed';
type Evidence = { id:string; kind:'quran'|'hadith'|'scholarly_opinion'|'official_guide'; citation:string; text?:string; url?:string; hadithGrade?:string; scholarOrSchool?:string; checkedAt?:string };
type Ruling = { id:string; stageId:string; titleAr:string; summaryAr:string; class:RuleClass; audience:'all'|'men'|'women'; evidenceIds:string[]; dispute?:{ opinions:{label:string; summary:string; evidenceIds:string[]}[]; notes:string }; reviewStatus:ReviewStatus; reviewedBy?:string; reviewedAt?:string };
type RitualStep = { id:string; stageId:string; titleAr:string; descriptionAr:string; rulingIds:string[]; requiredForProgress:boolean; sortOrder:number; audience:'all'|'men'|'women'; imageAsset?:string };
type Dua = { id:string; categoryId:string; text:string; notes?:string; origin:'personal'|'sourced'; evidenceIds?:string[]; pinned:boolean; order:number; createdAt:number; updatedAt:number };
type DuaDraft = { id:string; categoryId?:string; text:string; updatedAt:number };
type Task = { id:string; title:string; details?:string; scheduledAt?:string; done:boolean; order:number; createdAt:number; updatedAt:number };
type Progress = { tripId:string; ritualStepId:string; done:boolean; updatedAt:number };
type Trip = { id:string; title:string; startedAt?:number; completedAt?:number; createdAt:number };
```

Dexie tables: `duas`, `duaDrafts`, `categories`, `tasks`, `trips`, `progress`, `preferences`, `schemaMeta`, `eventOutbox` (only if optional counters enabled). All user-entered text stays local. Include migration and import/export version metadata.

## 5. Anonymous aggregate impact metrics (optional; opt-in architecture)

User wants only a rough measure of benefit. **Do not introduce fingerprinting, device IDs, cookies for cross-site tracking, IP logging, or user-level analytics.** Preferred privacy-first metric: aggregated event counts (e.g. 'app started', 'Umrah journey started', 'journey completed') through a tiny endpoint with no payload identifying a user; avoid retaining IP/user agent in app logs. A per-device unique count cannot be made exact without some persistent identifier, so display metrics as **approximate events, not unique people**. Offline event outbox can enqueue only anonymous counts; limit retries and duplicates with short-lived event UUIDs for idempotency, not stable device identifiers. Explicitly disclose anonymous counters in privacy page, and allow disabling them. This feature is P2: **ship with it disabled** until hosting, legal/privacy review, and data minimization are confirmed. No metrics endpoint should be required for app operation.

## 6. Visual system

- Islamic, serene, modern; ivory/cream backgrounds, deep emerald primary, muted gold accent, optional dark theme. No excessive ornament, no fake official Saudi branding.
- Arabic typography: bundled open-license font (e.g. Cairo / Noto Naskh Arabic with proper licensing) with system fallback; do not depend on online font load.
- Use restrained geometric motifs and subtle mosque-inspired shapes; avoid visually noisy backgrounds behind prayers.
- Cards with generous spacing; simple bottom navigation; high-contrast progress bars; responsive 320px–tablet.
- Include tasteful illustrations/diagrams only if appropriately licensed and stored locally; no hotlinked copyrighted photos. Put placeholder asset manifest and exact image requirements in `/docs/ASSET_PLAN.md`; don't invent images.
- Provide app icons, splash theme color, onboarding that is skippable, and clear Add to Home Screen instructions for iOS/Android.

## 7. Religious content: editorial and safety rules

**This is a content-review pipeline, not a fatwa engine.** Content in this spec comes from user's notes and is **not automatically verified**. All user-provided assertions must be triaged: `verified`, `needs_review`, or `incorrect_or_overgeneralized`. Cite source URLs and exact references in content records; don't fabricate Quran verse numbers, hadith numbering, grading, or school attribution. Distinguish practical instructions from legal classifications and from recommended du'as. Respect legitimate juristic disagreements. Avoid unsupported claims about special places/times where prayers are guaranteed to be accepted.

### 7.1 Starter source registry (verified page existence; NOT blanket validation of every ruling)

- `S01` Official Nusuk Umrah Journey: https://umrah.nusuk.sa/Journey — general sequence and tawaf.
- `S02` Official Nusuk Arabic Umrah page: https://www.nusuk.sa/umrah — planning and permits; do not copy branding.
- `S03` Ibn Baz, صفة العمرة: https://binbaz.org.sa/fatwas/11982/صفة-العمرة — rites, shaving/trimming differences.
- `S04` Ibn Baz, صفة مناسك الحج الثلاثة: https://binbaz.org.sa/fatwas/16511/صفة-مناسك-الحج-الثلاثة — miqat, entering ihram, conditional stipulation.
- `S05` Ibn Baz, حكم من خرج من الحرم للحلق: https://binbaz.org.sa/fatwas/10803/حكم-من-خرج-من-الحرم-للحلق-بعد-الطواف-والسعي — finishing Umrah before changing into ordinary male clothing; women may wear sewn garments.
- `S06` Ibn Baz, حكم من حبسه حابس: https://binbaz.org.sa/fatwas/16741/حكم-من-حبسه-حابس-عن-الطواف-والسعي — complex obstruction; requires careful application.
- `S07` Ibn Baz, عمرة أهل مكة: https://binbaz.org.sa/fatwas/14941/صفة-العمرة-لمن-كان-من-اهل-مكة — entering ihram from outside Haram for those in Makkah.

**IMPORTANT:** Source registry only contains pages checked for existence and relevant topic. Editorial reviewer must independently check each quoted rule and exact text. Do not present as 'scholarly approved' without a named qualified reviewer.

### 7.2 User notes to ingest and triage (NOT verbatim public rulings)

**Preparation / attire:** men wear izar/rida; garment shape vs mere stitching; clips/pins/Velcro/elastic and belts require nuanced rulings; male head coverings, socks/footwear, gloves; women's normal modest dress without mandated color, no niqab/gloves in ihram, distinction between fitted face covering and lowering outer veil before non-mahrams; avoid attributing 'tawaf is prayer' as a complete legal proof without checking its status/context. Minimum awrah covering and idtiba' details. Bathing, trimming nails/hair before ihram, perfume on body before entering ihram vs perfume on garment after; replacing ihram garments is permitted in principle, contrary to user's note.

**Miqat:** Dhul-Hulayfah (Abyar Ali), al-Juhfah (Rabigh area), Qarn al-Manazil (as-Sayl al-Kabir), Yalamlam, Dhat Irq; people passing a miqat intending rites, air travel, residents inside miqat, Makkah resident going outside Haram for Umrah. Do NOT rely on user's approximate kilometer figures without verification; distance depends on point/route. Correct user's phrase 'pass without tahallul': issue is entering ihram at/before miqat, not tahallul.

**Ihram and talbiyah:** intention to enter rites, saying 'لبيك عمرة', full talbiyah text with authentic evidence, optional conditional stipulation 'فإن حبسني حابس فمحلي حيث حبستني' and its scholarly scope, Umrah on behalf of deceased/permanently incapable with eligibility conditions, menstruation during ihram and deferred tawaf; do not claim automatic exit from ihram when menses persist. Prohibitions including intentional hair/nail removal, accidental hair shedding, fragrance, head covering, marital relations, hunting etc. Distinguish gender-specific and shared restrictions, exceptions, ignorance/forgetfulness and potential fidyah. Talbiyah until tawaf and voice difference.

**Entering Haram / Tawaf:** verified mosque entry du'a; alleged 'اللهم أنت السلام ومنك السلام...' upon first seeing Kaaba requires authenticity review and must not be labeled established sunnah without evidence. Black Stone touching/kissing if possible without crowding, pointing/takbir otherwise; user-proposed longer formula requires proof. Seven circuits, Kaaba to left, outside Hijr Ismail, starting at Black Stone; prayer interruptions and ablution disputes, women's circumstances. Idtiba' throughout tawaf for men (not throughout all rites); ramal in first three circuits for men where feasible, not women. Yemeni corner touch if feasible, no pointing if not; between it and Black Stone 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار'. No fixed du'a for each circuit. No crowding or harm. Hijr Ismail: tawaf within it invalid; voluntary prayer inside is permissible, obligatory prayer there has juristic issues—do not blanket-ban all prayer.

**After Tawaf:** cover both shoulders, two rak'ahs of tawaf behind Maqam Ibrahim if feasible, otherwise elsewhere; al-Kafirun / al-Ikhlas where established, Zamzam, optional return to Black Stone without crowding. Distinguish sunnah from obligatory elements.

**Sa'i:** verse 2:158 recited at beginning (check exact prophetic wording); 'نبدأ بما بدأ الله به'; face qiblah on Safa/Marwah and recite established remembrance (check precise text, repetitions and placement of du'a); seven legs Safa->Marwah = 1, ending Marwah; men move briskly between green markers, women walk; wudu not a condition according to widely held view; no fixed du'a for each lap. Avoid unsourced recommendation of particular floor as spiritually superior.

**Tahallul:** men shave or trim from entire head, women trim ends only; relative virtue of shaving, special circumstances of another imminent Hajj/Umrah, bald men need review. Track completion without giving false automatic religious verdicts.

**FAQ:** forgotten circuit, doubts about count, interrupted tawaf, menstrual bleeding, disability/wheelchair, elderly/children, lost wudu, crowding, ihram garment swap, scented products, hair falling unintentionally, Umrah on behalf of another, missed miqat, conditional stipulation, mistake and fidyah. Complex answers require citations and reviewer approval.

### 7.3 Editorial source mapping / release gate

Every public normative `Ruling` must have >=1 checked evidence reference and `reviewStatus='verified'`. Any dispute card must identify views accurately and distinguish evidence from modern commentary. Build `/docs/RELIGIOUS_REVIEW_QUEUE.md` containing unresolved items. Include explicit in-app disclaimer: 'هذا دليل تعليمي، وليس فتوى شخصية. في الحالات الخاصة أو عند الشك في صحة النسك، اسأل أهل العلم.'

## 8. App content file layout

```
src/
  app/              # routing, providers, app shell
  components/       # shared accessible UI, evidence sheet
  features/
    day-plan/
    duas/
    umrah/
    faq/
    settings/
  db/               # Dexie schema, migrations, repository, backup
  content/
    sources.ts
    stages.ts
    rulings.ts
    supplications.ts
    faq.ts
  pwa/
  styles/
public/
  icons/
  illustrations/
docs/
  PRD.md
  ARCHITECTURE.md
  CONTENT_EDITORIAL_POLICY.md
  RELIGIOUS_REVIEW_QUEUE.md
  ASSET_PLAN.md
  TEST_PLAN.md
  DEPLOYMENT.md
```

## 9. Acceptance criteria / test plan

1. PWA can be installed on supported Android browser and iPhone Safari (instructions supplied), HTTPS manifest valid.
2. After first successful load/cache, all core screens, content, and user notes are usable in airplane mode, including hard reload where supported.
3. Type a du'a, navigate away immediately, close and reopen app, and see exact text; test no Save click and offline. Test long Arabic text and multiple rapid edits.
4. Add/edit/reorder/complete tasks and ritual steps; reload offline and preserve state.
5. Distinct trip progress; resetting one trip must not delete personal du'as or other trips.
6. Export JSON locally, clear data only after explicit confirmation, restore validated backup and preserve Unicode; reject malformed/oversized imports safely.
7. Women/men toggle affects only relevant guidance; shared steps remain visible.
8. Each published ruling has working evidence sheet and source metadata; no unsupported du'a attributed to Prophet ﷺ; `needs_review` rulings never rendered as definitive.
9. No third-party analytics, account screens, network calls for user notes, or background telemetry. Verify in browser network panel.
10. Arabic RTL visual tests at 320/375/430px; keyboard and screen reader labeling; accessible contrast.
11. Tests: unit tests for DB repositories and content validation, component tests for autosave and checklist, Playwright E2E for offline and restore where feasible; `npm run build` and tests pass.
12. Provide README with exact install/run/build/test commands, deployment guide, known iOS storage caveats and content review gaps.

## 10. Milestone implementation order

**M0 Setup:** inspect repo, dependencies, routes, RTL design system, data models, PWA manifest/icons, tests scaffolding.

**M1 Personal value:** du'a categories and autosave with durable drafts; day planner and local tasks; export/import; robust IndexedDB migrations.

**M2 Rites:** stage stepper, checklist, gender annotations, evidence modal, locally bundled initial verified content; review queue for remaining claims.

**M3 Offline & quality:** precache, airplane-mode E2E, installation flows, update-safe behavior, accessibility, privacy notice, responsive polish.

**M4 Optional after release:** privacy-reviewed anonymous event counters (not users), licensed illustrations, more sourced FAQs, Hajj module design. Do not block MVP on M4.

## 11. Final Codex output requirements

At completion report: what was built; exact commands and test results; files created; screenshots or visual QA if supported; unresolved religious review queue; offline caveats; deployment steps; whether any network requests exist; anything that remains intentionally disabled. **Never claim the religious guide is complete or approved until review is completed.**

---

### Kickoff prompt (paste into Codex)

Implement the attached `ZAAD_CODEX_MASTER_SPEC.md` in this repository, starting with M0–M3. Prioritize reliable offline personal du'a autosave, daily planner, and Umrah checklist. Read all constraints, especially no accounts, no personal telemetry, no fabricated religious citations, and no publication of unreviewed rulings. Build actual working code, run tests/build, and maintain docs. If source claims cannot be validated, create an editorial review queue rather than guessing. At the end give a concise implementation report and exact commands to run locally and deploy.
