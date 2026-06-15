
# Hugh's OSCE Case Generator — Build Plan

Your spec is ~15 distinct feature areas. Building all of it in one pass would produce a shallow, half-working app. I'll deliver a tight, high-quality **v1 foundation** with the brand, data model, and the most exam-critical flows fully working, then layer the rest in follow-up turns.

## What v1 will ship

**Brand & shell**
- App name "Hugh's OSCE Case Generator" + subtitle, warm off-white / deep navy / muted-red palette, serif display + clean sans pairing, card-based academic handbook feel.
- Sidebar (desktop) + drawer (mobile), footer disclaimer.

**Data layer (local TypeScript, no backend yet)**
- `ConditionProtocol`, `OSCECase`, `MarkingRubric` types exactly per your spec.
- Seeded protocol cards for ~8 priority conditions (GORD, allergic rhinitis, otitis media, asthma, COPD, impetigo, shingles, contraception) with age limits, in/out-of-scope, red flags, review times, vaccination prompts, communication frameworks — all marked `protocolConfidence` and `protocolSource: "Queensland Health – needs verification"` so no dose is shown unless explicitly verified.
- Seeded OSCE cases for the IPA worked examples you listed (ABDO 1/2, ENT 1/2, MSK 1/2, RESP 1/2, Impetigo, Shingles, Psoriasis, Acne-in-pregnancy, Contraception, Obesity, Smoking cessation) — each with candidate stem, fake patient script, hidden answers, vitals, exam findings, scope decision, reasoning, non-pharm plan, safety-net, marking rubric, critical fails.

**Working pages**
1. **Dashboard** — stats, quick-launch cards (8-min OSCE, red-flag sprint, scope drill, protocol trap, random).
2. **Generate Case** — full filter panel (category, condition, case type, difficulty, time, output format) → renders case.
3. **Practice Exam Mode** — timer, candidate stem, reading-time skeleton (3-column IPA layout), notes, request vitals/exam panels, scope decision, treatment, safety-net, reveal answer, examiner checklist scoring.
4. **Fake Patient Mode** — actor view with opening line, hidden-answer accordions per category, "only if asked" sections, reveal buttons.
5. **Examiner Mode** — fold-line printable layout (candidate top / examiner bottom), rubric with Not done / Partial / Done well + critical-fail toggles, auto feedback.
6. **Scope Checker** — form inputs → scope status badge + protocol rule + suggested OSCE wording.
7. **Red Flag Library** — searchable, includes CHUPO, CANVASSHU, SIP, SOCRATES, HEADSSS, SNAP, 5As, ISBAR acronym cards.
8. **Condition Protocol Cards** — one card per seeded condition, all required fields.
9. **Safety-Net Builder** — inputs → patient-friendly script + GP letter paragraph using the review-time table you provided.
10. **GP Letter Generator** — ISBAR template, 5 letter types.
11. **Examination Skills** — GALS, Respiratory, ENT, Abdominal, Cardiovascular checklists.
12. **References** — protocol source list + disclaimer.

**Reusable components** built per your list (CandidateStemCard, FakePatientScript, HiddenAnswerAccordion, VitalsRevealPanel, ExaminationRevealPanel, ScopeDecisionBadge, ProtocolCheckWarning, RedFlagBox, TreatReferBox, EmergencyReferralBox, ExaminerChecklist, Timer, etc.).

**Guardrails wired from day one**
- No hardcoded doses in v1 — every pharmacological section renders `<ProtocolCheckWarning>` ("Protocol check required — verify against current Queensland Health guideline before prescribing") with class-level guidance only. This honours your "never hallucinate a dose" rule.
- Every case carries a scope badge, red flags, review time, referral logic, hidden examiner answer.

## What's deferred to follow-up turns (call them out explicitly)

- **My Performance** tracking (needs Lovable Cloud / persistence).
- **Admin / import tools** (needs Cloud + auth + role table).
- **AI case generation** (only worth wiring once the protocol DB is verified — otherwise it violates your "never invent" rule).
- **Print/export PDFs** (browser print CSS will work; dedicated PDF export later).
- **Global search across everything** (basic per-page search in v1).
- Filling in the remaining ~13 conditions' full protocol cards and additional generated cases beyond the IPA-seeded ones.
- Two-person roleplay sync, brutal mode hidden prompts.

These are explicitly stubbed with "Coming soon" cards rather than faked.

## Technical notes

- TanStack Start (current template), Tailwind v4 tokens in `src/styles.css`, shadcn components with custom variants (scope-green / scope-amber / scope-red / scope-black), lucide icons, framer-motion for subtle transitions only.
- Data lives in `src/data/protocols.ts` and `src/data/cases.ts` — typed, easy to extend, ready to swap for Supabase later.
- File-based routes under `src/routes/` (dashboard at `/`, plus one route per page above).
- Footer disclaimer in `__root.tsx`.

## Scale estimate

~25–30 new files. I'll batch all writes in parallel where possible.

---

**Approve and I'll build v1.** If you'd rather I start with a narrower slice (e.g. just Generate Case + Practice Exam Mode + the IPA-seeded case bank, then iterate), say so and I'll trim accordingly.
