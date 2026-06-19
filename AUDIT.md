# practiceosce Audit

Date: 2026-06-19

Repo: `vpnhugh-openclaw/practiceosce`

Branch audited: `nav-rationalisation`

Preview tested: `https://practiceosce.lovable.app`

Local tested: `npm install`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, local dev at `http://127.0.0.1:8080`

Viewports tested:

- iPhone: `390x844`
- iPad portrait: `768x1024`
- iPad landscape: `1024x768`
- Desktop: `1440x900`

## Detected stack

- App framework: TanStack Start on Vite
- Router: `@tanstack/react-router`
- Styling: Tailwind CSS v4
- State/data: local React state + TanStack Query present in app shell
- UI primitives: Radix UI + Lucide icons

## Route inventory

- `/` Dashboard
- `/generate` Generate Case
- `/practice` Practice Exam Mode
- `/patient` Fake Patient Mode
- `/examiner` Examiner Mode
- `/viva` Viva Mode
- `/scope` Scope Checker
- `/redflags` Red Flag Library
- `/examination` Examination Skills
- `/protocols` Condition Protocol Cards
- `/safetynet` Safety-Net Builder
- `/letter` GP Letter Generator
- `/performance` My Performance
- `/cases` Case Bank
- `/cases/$caseId` Case detail
- `/references` References
- `/qa` Content QA (admin)

## Navigation controls found

Global sidebar in [src/components/AppShell.tsx](src/components/AppShell.tsx):

- Dashboard
- Generate Case
- Practice Exam Mode
- Fake Patient Mode
- Examiner Mode
- Viva Mode
- Scope Checker
- Red Flag Library
- Examination Skills
- Condition Protocol Cards
- Safety-Net Builder
- GP Letter Generator
- My Performance
- Case Bank
- References
- Content QA (admin)

Dashboard in [src/routes/index.tsx](src/routes/index.tsx):

- Header CTAs: Generate a case, Start practice exam
- Quick launch cards: 20-minute Real OSCE Practice, Viva sprint, Scope decision drill, Queensland protocol trap, Random mixed case, Condition protocol cards, Red flag library
- Case bank preview cards to `/cases/$caseId`

Generator in [src/routes/generate.tsx](src/routes/generate.tsx):

- Filters: Subject, Role / view, Condition category, Case type, Difficulty, Time
- Random pick open-case CTA
- Matched case cards to `/cases/$caseId`

Practice in [src/routes/practice.tsx](src/routes/practice.tsx):

- Case selector
- Print / Save PDF
- Unsafe-state actions: Use anyway, Open Content QA
- Reveal answer / Hide answer
- Open full case

Case detail in [src/routes/cases.$caseId.tsx](src/routes/cases.$caseId.tsx):

- Practice
- Patient view
- Examiner
- Print
- Back to case bank on not-found

Examiner in [src/routes/examiner.tsx](src/routes/examiner.tsx):

- Case selector
- Timer controls inside `CountdownTimer`
- Live rubric mark buttons
- Critical fail checkboxes
- Log attempt
- View history
- Print / Save PDF

Performance in [src/routes/performance.tsx](src/routes/performance.tsx):

- Open Examiner Mode
- Clear history

QA in [src/routes/qa.tsx](src/routes/qa.tsx):

- Filter chips
- Case links to `/cases/$caseId`

References in [src/routes/references.tsx](src/routes/references.tsx):

- External source links

Letter in [src/routes/letter.tsx](src/routes/letter.tsx):

- Copy to clipboard

Patient/Viva/Scope/Protocols/Redflags/Examination/Safetynet:

- Internal expand/reveal controls and form controls, but no meaningful onward in-flow navigation beyond the global sidebar

## Navigation graph

Global fact:

- Every route links back to all 16 sidebar destinations because the sidebar is mounted in the app shell on every page.
- This means every page also contains a self-loop via the active sidebar item.

Inline route graph:

- `/` -> `/generate`, `/practice`, `/viva`, `/scope`, `/protocols`, `/redflags`, `/cases/$caseId`
- `/generate` -> `/cases/$caseId`
- `/practice` -> `/qa`, `/cases/$caseId`
- `/cases` -> `/cases/$caseId`
- `/cases/$caseId` -> `/cases`, `/practice`, `/patient`, `/examiner`
- `/examiner` -> `/performance`
- `/performance` -> `/examiner`
- `/qa` -> `/cases/$caseId`
- `/references` -> external links
- `/letter` -> clipboard action only
- `/patient`, `/viva`, `/scope`, `/redflags`, `/examination`, `/protocols`, `/safetynet` -> no contextual onward links beyond global sidebar

Detected loops:

- `/cases/$caseId` -> `/practice` -> `/cases/$caseId`
- `/cases/$caseId` -> `/examiner` -> `/performance` -> `/examiner`
- `/cases/$caseId` -> `/patient` -> sidebar -> `/cases` or another unrelated page
- Any route -> active sidebar item -> same route

Contextual dead ends:

- `/patient`
- `/viva`
- `/scope`
- `/redflags`
- `/examination`
- `/protocols`
- `/safetynet`
- `/letter`
- `/references`

These pages only escape through the global menu, not through local next-step actions.

## A. What's broken

### Blocker

1. Role/view selector does nothing
   - What: The `Role / view` control changes local state but never changes filtering, routing, or output.
   - Where: [src/routes/generate.tsx](src/routes/generate.tsx) route `/generate`, lines 27, 35, 56
   - Why it's a problem: A visible core control is non-functional, so users believe they are choosing Student brief vs Fake patient script vs Timed practice when nothing actually changes.
   - Proposed fix: Replace the dead selector with real navigation targets, or remove it. For the requested IA, route these choices into explicit Solo vs Actor/Examiner entry points.

2. Case-context handoff is broken between Case, Practice, Patient, and Examiner
   - What: Case detail links to generic `/practice`, `/patient`, and `/examiner`, but those pages each initialise themselves to `CASES[0]` rather than the selected case.
   - Where: [src/routes/cases.$caseId.tsx](src/routes/cases.$caseId.tsx) route `/cases/$caseId`, lines 44-46; [src/routes/practice.tsx](src/routes/practice.tsx) line 27; [src/routes/patient.tsx](src/routes/patient.tsx) line 14; [src/routes/examiner.tsx](src/routes/examiner.tsx) line 28
   - Why it's a problem: The advertised two-person flow is unreliable. A user can open a case, tap Patient or Examiner, and land on a different default case unless they manually reselect it.
   - Proposed fix: Introduce case-aware mode routes and carry `caseId` through navigation. Practice Exam Mode should own the actor/examiner workflow with shared case context.

3. Copy-to-clipboard throws an unhandled runtime error
   - What: Clicking `Copy to clipboard` throws `Failed to execute 'writeText' on 'Clipboard': Write permission denied.`
   - Where: [src/routes/letter.tsx](src/routes/letter.tsx) route `/letter`, line 75
   - Why it's a problem: The control can fail silently for end users because there is no `try/catch`, no fallback, and no success/error feedback.
   - Proposed fix: Wrap clipboard writes in `try/catch`, show a toast/status message, and provide a text-selection fallback.

### Major

4. Lint is failing at repo level
   - What: `npm run lint` fails with 1155 problems, almost all Prettier formatting issues, plus a few warnings.
   - Where: repo-wide; first surfaced across many files including `src/components/osce/*` and `src/routes/*`
   - Why it's a problem: CI/editor trust is low, and real problems are buried under formatting noise.
   - Proposed fix: Run a formatting cleanup pass or relax lint until formatting is standardised.

5. Build/dev warnings indicate stale config assumptions
   - What: Vite warns that `vite-tsconfig-paths` is redundant and Lovable nitro context is missing locally.
   - Where: `vite.config.ts` during `npm run build` and `npm run dev`
   - Why it's a problem: Not a blocker, but it adds noise and suggests local-vs-hosted config drift.
   - Proposed fix: Simplify Vite config after navigation work lands.

6. Dashboard quick-launch intents are mislabeled or duplicated
   - What: `Queensland protocol trap` and `Random mixed case` both go to the same generic generator route.
   - Where: [src/routes/index.tsx](src/routes/index.tsx) route `/`, lines 21-29
   - Why it's a problem: Different promises lead to the same destination with no prefiltered state, which feels broken even though the link resolves.
   - Proposed fix: Either preconfigure the generator by intent or remove duplicated launch cards.

### Minor

7. Patient-mode reveal rows can expand to almost no content
   - What: Entries from `p.onlyIfAsked` render `HiddenReveal` with `:` as the only revealed content.
   - Where: [src/routes/patient.tsx](src/routes/patient.tsx) route `/patient`, lines 35-38
   - Why it's a problem: The control looks interactive but often reveals nothing useful.
   - Proposed fix: Render the value directly if it is already the answer, or pair each prompt with actual hidden content.

## B. What doesn't make sense

### Major

1. Practice, Patient, and Examiner are modeled as separate top-level products instead of one workflow
   - What: Three sibling menu items represent one exam scenario split across solo practice, actor view, and examiner view.
   - Where: [src/components/AppShell.tsx](src/components/AppShell.tsx) lines 27-29
   - Why it's a problem: The information architecture makes related steps feel unrelated and encourages circular jumping.
   - Proposed fix: Nest them under `Practice Exam Mode`, with exactly two children:
     - Actor / Examiner Mode
     - Solo Mode

2. `Generate Case` overlaps heavily with `Case Bank`
   - What: Both pages are effectively lists of seeded cases that end at `/cases/$caseId`.
   - Where: [src/routes/generate.tsx](src/routes/generate.tsx) route `/generate`; [src/routes/cases.index.tsx](src/routes/cases.index.tsx) route `/cases`
   - Why it's a problem: Users have to guess whether they are browsing, filtering, or generating. The app is not generating novel cases here; it is selecting from a catalogue.
   - Proposed fix: Rename `/generate` to a selector or launcher, or merge its filter UI into Case Bank.

3. Admin QA is embedded in learner flow
   - What: Practice mode sends blocked cases to `Content QA (admin)`.
   - Where: [src/routes/practice.tsx](src/routes/practice.tsx) route `/practice`, lines 73-99; sidebar item at [src/components/AppShell.tsx](src/components/AppShell.tsx) line 40
   - Why it's a problem: A student-facing route ejects the user into an admin area that is not part of normal practice.
   - Proposed fix: Keep QA out of the primary learner nav and gate it as admin/debug only.

4. Several pages are effectively orphans from a task-flow perspective
   - What: `/viva`, `/scope`, `/redflags`, `/examination`, `/protocols`, `/safetynet`, `/references`, and `/letter` have no contextual onward actions besides the global menu.
   - Where: their respective route files
   - Why it's a problem: They are reachable, but not integrated. Users hit a tool page and must mentally decide the next step with no guidance.
   - Proposed fix: Add next-step CTAs or cross-links based on likely follow-up actions.

### Minor

5. Naming is inconsistent for the same concept
   - What: `Practice Exam Mode`, `Real OSCE Practice`, `20-minute Real OSCE Practice`, `Fake Patient Mode`, `Actor's script`, and `Examiner Mode` all describe one exam ecosystem with different labels.
   - Where: sidebar, dashboard, practice page, patient page
   - Why it's a problem: It increases cognitive load and makes the hierarchy feel accidental.
   - Proposed fix: Standardise naming around one parent concept and two child modes.

## C. Navigation problems

### Blocker

1. Explicit circular workflow without clear forward progress
   - What: `/examiner` links to `/performance`, and the empty state of `/performance` links straight back to `/examiner`.
   - Where: [src/routes/examiner.tsx](src/routes/examiner.tsx) lines 254-258; [src/routes/performance.tsx](src/routes/performance.tsx) lines 61-72
   - Why it's a problem: A user with no history is bounced back into marking mode instead of being guided into the broader practice flow.
   - Proposed fix: Make Performance a reporting destination under Solo Mode, not a sibling loop off Examiner Mode.

2. Case page launches mode pages that discard the chosen case
   - What: `/cases/$caseId` -> `/practice` or `/patient` or `/examiner` without preserving `caseId`
   - Where: [src/routes/cases.$caseId.tsx](src/routes/cases.$caseId.tsx) lines 44-46
   - Why it's a problem: This is both a navigation bug and a conceptual bug. The user thinks they are moving forward into the same station, but they are actually resetting into generic mode screens.
   - Proposed fix: Move to explicit child routes under Practice Exam Mode that accept case context.

### Major

3. Menu is over-flat and over-nested in the wrong place
   - What: There are 16 first-level destinations in the sidebar and several of them are tools inside a larger practice flow.
   - Where: [src/components/AppShell.tsx](src/components/AppShell.tsx) lines 24-40
   - Why it's a problem: Flat nav is fine when sections are independent. Here it creates ambiguity and makes the user hunt instead of follow a path.
   - Proposed fix: Reduce top-level choices and group by user task rather than by implementation artifact.

4. Too many redundant paths reach the same endpoint
   - What: Users can reach cases from Dashboard preview, Generate Case, Case Bank, QA, Practice, and the global menu.
   - Where: [src/routes/index.tsx](src/routes/index.tsx), [src/routes/generate.tsx](src/routes/generate.tsx), [src/routes/cases.index.tsx](src/routes/cases.index.tsx), [src/routes/qa.tsx](src/routes/qa.tsx), [src/routes/practice.tsx](src/routes/practice.tsx)
   - Why it's a problem: Redundancy is helpful only if each entry path communicates a distinct mode. Here the meanings blur together.
   - Proposed fix: Keep one browse entry, one filtered entry, and one active practice entry.

5. Self-loops are everywhere
   - What: Every page contains a link to itself via the sidebar.
   - Where: [src/components/AppShell.tsx](src/components/AppShell.tsx) lines 62-81
   - Why it's a problem: Not fatal, but it adds no value and contributes to the feeling of circularity.
   - Proposed fix: Treat active items as labels instead of clickable links, or disable pointer interaction on the active route.

6. No breadcrumbs or local back actions on tool-style pages
   - What: Most non-case pages offer no local route back to their parent concept.
   - Where: `patient`, `viva`, `scope`, `redflags`, `protocols`, `safetynet`, `letter`, `references`
   - Why it's a problem: Browser back becomes the only meaningful in-flow control.
   - Proposed fix: Add local secondary nav or parent labels once the hierarchy is rationalised.

## D. Mobile and tablet usability

### Major

1. Sidebar tap targets are undersized on touch devices
   - What: Sidebar links render at roughly `36px` high in testing.
   - Where: [src/components/AppShell.tsx](src/components/AppShell.tsx) lines 67-79
   - Why it's a problem: iPhone and iPad users should get at least ~44px touch targets for reliable tapping.
   - Proposed fix: Increase row height/padding and reduce top-level item count.

2. Mobile nav is cognitively overloaded
   - What: On iPhone and iPad portrait, the off-canvas menu exposes 16 first-level choices before the user even reaches content.
   - Where: [src/components/AppShell.tsx](src/components/AppShell.tsx) lines 24-40
   - Why it's a problem: One-handed use suffers because the user must open a drawer, scan a long list, then choose among overlapping terms.
   - Proposed fix: Collapse related tools under fewer parents. The requested Practice Exam Mode split is the highest-value simplification.

### Minor

3. No horizontal overflow detected in tested routes
   - What: Local and live tests at `390`, `768`, `1024`, and desktop widths showed no horizontal page overflow on the sampled routes.
   - Where: `/`, `/practice`, `/patient`, `/examiner`, `/performance`, `/cases`, `/cases/ent-1-otitis`, `/references`, `/qa`
   - Why it's a problem: Not a problem; this is a pass.
   - Proposed fix: Keep the current responsive content widths while simplifying navigation.

4. Console/runtime noise was low outside the clipboard issue
   - What: No route-level console errors or 404s were observed on tested local/live routes except the clipboard permission failure.
   - Where: tested routes above
   - Why it's a problem: Also a pass.
   - Proposed fix: Preserve this during refactor.

## Baseline command results

- `npm install`: succeeded
- `npm run build`: succeeded
- `npx tsc --noEmit`: succeeded
- `npm run lint`: failed with 1155 issues, mostly Prettier formatting errors

Build warnings captured:

- `[@lovable.dev/vite-tanstack-config] No Lovable context detected — skipping nitro deploy plugin.`
- `The plugin "vite-tsconfig-paths" is detected. Vite now supports tsconfig paths resolution natively...`

Runtime/browser findings captured:

- Clipboard error on `/letter`: `Failed to execute 'writeText' on 'Clipboard': Write permission denied.`

## Recommended implementation direction

1. Make `Practice Exam Mode` the parent concept.
2. Give it exactly two children:
   - `Actor / Examiner Mode`
   - `Solo Mode`
3. Preserve `caseId` across those child routes.
4. Remove `Fake Patient Mode` and `Examiner Mode` as top-level siblings.
5. Reposition `My Performance` under Solo Mode or as a contextual child, not as a separate first-level item.
6. Either merge `Generate Case` with `Case Bank` or turn it into a true launcher with mode-aware routing.
