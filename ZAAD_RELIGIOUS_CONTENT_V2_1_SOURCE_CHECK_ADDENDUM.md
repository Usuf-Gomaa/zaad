# ZAAD — Religious Content v2.1 | Source-check addendum
**Date:** 2026-11-23  
**Status:** Editorial research only — NOT scholarly approval or permission for public release.

## Purpose and integration rules
This supplements `ZAAD_RELIGIOUS_CONTENT_V2_REVIEW_DRAFT.md` rather than replacing its 34 rite records and 16 FAQ drafts. Maintain their stable IDs, original context, and `needs_review` status. This document distinguishes a **source text observed on a primary/reference page** from **qualified review of the religious ruling**. A verified excerpt is not verification of an entire record, nor authorization to set `sourceCoverageConfirmed=true`.

## Newly checked source-level items

### B02 — Talbiyah (Arabic exact quotation checked)
- **Source:** Sahih al-Bukhari 1549, Book of Hajj, chapter on Talbiyah, narrated from Ibn Umar: https://sunnah.com/bukhari:1549
- **Arabic quotation as displayed by source (short excerpt):** «لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ»
- **Rest of wording:** read directly from the linked hadith before inserting the full liturgical card; the source includes praise, blessings and dominion and concludes with the declaration that Allah has no partner.
- **English:** the linked hadith provides a published English rendering, but its provenance and suitability for app publication still need translation/editorial review. Do not mark `englishMeaning.verified` true.
- **Boundary:** the hadith establishes the reported wording; it does not by itself verify every app claim about when to start/stop, how loudly women recite, or exceptions. Leave record `needs_review`.

### DUA-Q2-201 — Quranic supplication (verse and published English meaning located)
- **Source:** Quran.com, Quran Duas page, Al-Baqarah 2:201: https://quran.com/duas/arabic-english-transliteration
- **Reference:** Al-Baqarah, verse 201. Quran.com presents the full Arabic verse and a published English meaning. For Uthmani orthography, copy directly from the chosen Quran text source; do not type from memory or normalize the diacritics.
- **Editorial meaning paraphrase (NOT approved translation):** asking Allah for goodness in this world and the next and protection from the Fire.
- **Boundary:** presence in the Quran does not by itself prove a fixed repetition count or that it must be said in a particular tawaf circuit. Leave Arabic final insertion and English translation approval pending.

### FAQ14 / F04 — Forgot shaving or trimming (specific fatwa checked)
- **Source:** Ibn Baz, «حكم من نسي الحلق أو التقصير في العمرة»: https://binbaz.org.sa/fatwas/16713/حكم-من-نسي-الحلق-او-التقصير-في-العمرة
- **Source position, paraphrased:** for the specific question about someone who completed tawaf and sa'i, wore normal male clothing and then remembered he had not shaved/trimmed, the fatwa instructs him to remove those clothes on remembering and shave/trim before putting them back on; it distinguishes forgetfulness/ignorance from deliberate conduct.
- **Boundary:** this is a particular scholar's answer to a particular scenario. Do not extrapolate to intercourse, all violations, women's situations, or every madhhab. No automatic fidyah or validity engine.

### F01 — Shaving vs trimming (specific fatwa checked)
- **Source:** Ibn Baz, «الحلق أفضل من التقصير»: https://binbaz.org.sa/fatwas/16338/الحلق-افضل-من-التقصير
- **Source position, paraphrased:** shaving is generally preferred, with a contextual exception mentioned when Umrah is near Hajj; the fatwa also discusses covering the entire head rather than only part of it.
- **Boundary:** do not flatten the near-Hajj exception or label the source's school-specific position as unanimous. Leave `needs_review`.

## Content and translation work that is still OPEN
- **R8 / Muslim 1218:** full wording of the Safa/Marwa remembrance, repetition and exact citation still require source-by-source checking. Do not fill E02 from memory.
- **C01:** mosque-entry wording and claim about first seeing Kaaba require specific textual source checks.
- **C04/C05:** Yemeni corner and the dua between the corners require direct hadith/grade verification.
- **D03:** two-rak'ah recitations require exact hadith locator/context.
- **B03:** conditional stipulation wording and scope require exact source checking.
- **FAQ01–FAQ16:** do not mark any FAQ answer complete from this addendum. Only FAQ14 gains a specific checked candidate source, not qualified approval.
- **English:** No independently reviewed English religious records or translations. Do not publish translations or set verified flags.
- **All 14 correction flags:** remain open pending itemized reconciliation and scholarly review.

## Required reviewer-facing evidence structure
For every claim display: stable ID, claim text, Arabic/English audience, source URL, source title, exact hadith/verse/fatwa locator, short quotation where permitted, evidence-to-claim rationale, checking identity/date/method, applicable opinion/school, unresolved exceptions, and scholarly review status. Separate **source checking** from **scholarly approval** in the UI and export. Never populate the qualified reviewer fields with Codex, an AI model, or a fabricated person.

## Practical handoff to Codex
1. Import this addendum into the development/staging review workspace, linked to B02, DUA-Q2-201, FAQ14/F04 and F01.
2. Add the source entries with explicit *partial source check* status, and display what each source does and does not establish.
3. Do not set any whole record to `source_checked` or `scholarly_approved`; preserve the publication gate and all 51 existing statuses.
4. Do not deploy. Preserve IndexedDB v2, user data, bilingual UI, offline caching, and safe updates.
5. Generate an updated editorial verification matrix and reviewer export. Flag all unverified liturgical wording and English meanings clearly.

## Research provenance
The source URLs above were inspected through web retrieval on 2026-11-23 for the statements specified here. This document does not claim exhaustive textual collation, scholarly qualification, or a completed English translation review.
