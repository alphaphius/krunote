# KruNote — Implementation Brief

> Working name for design approval. The final product name can change without changing the data model.

## Product purpose

KruNote is a private, single-teacher gradebook and classroom tracking PWA for Thai secondary school classes. It reduces repetitive navigation by making attendance, assignment submission, total-score entry, and behavior notes editable from one roster-oriented surface.

## Confirmed scope

- One teacher and one private deployment.
- Academic years and terms.
- Grade levels ม.4, ม.5, and ม.6, with multiple rooms per level.
- Multiple subjects and teaching groups.
- Student master data: student ID, class number, title, first name, last name, nickname, grade level, room, status, and optional private note.
- Attendance per teaching session: present, late, absent, or leave.
- Assignment submission tracking: submitted, late, missing, or exempt.
- Assessments with one total score per student; no per-question scoring.
- One assessment can target one or many rooms within the intended grade level.
- Assignment workflow: draft, scheduled/open, due for review, reviewing, reviewed, and archived.
- Work creation includes target grade/rooms, assigned date, due date, maximum score, category, instructions, and optional attachment.
- A review queue groups work that has reached its due date and shows review progress by room.
- Behavior notes recorded inline from the roster; they do not affect grades by default.
- Configurable score categories, weights, grade thresholds, preview, validation, and grade lock.
- PDF and Excel export for one room, selected rooms, one grade level, or every taught room.
- Optional mock data created only when explicitly selected during setup.
- Offline-first edits with visible queue, retry, and conflict states.
- Thai and English UI; Thai is the default locale.

## Primary workflows

1. Choose year, term, grade, room, subject, and session or assessment.
2. Start with all active students present and edit only exceptions.
3. Mark submission status for the whole roster without opening student profiles.
4. Create an assignment once, target one or many rooms, and let it enter the review queue when due.
5. Open a review batch and mark submission status plus total score for the whole room in Quick Edit.
6. Add a short behavior note from a student row.
7. Review missing or invalid scores, preview calculated grades, then lock results.
8. Request PDF/Excel export and continue working while the background job runs.

## Success criteria

- A 40–50 student attendance session can be completed in under two minutes.
- A teacher can update attendance or submission with one tap per exception.
- Score entry supports Enter, arrow keys, numeric keypad, and spreadsheet paste.
- Offline edits survive reload and sync without duplicate records.
- Invalid scores, missing scores, and grade-impacting configuration changes are explicit.
- Generated reports match the selected scope and never claim completion before the export job succeeds.
- No protected student records are loaded before PIN authorization.

## Access, sensitivity, and audit

- Single-user PIN access is accepted for this private tool.
- A random initial PIN is shown once during setup and must be replaced.
- PIN verification, rate limiting, salted verifier material, and session issuance live in Apps Script.
- Settings, endpoint changes, export of all data, backup/restore, grade unlock, and destructive maintenance require recent re-authentication.
- Student names, scores, attendance, behavior notes, and Drive report links are protected data.
- Audit records cover score edits, grade locks/unlocks, roster changes, import, export, and maintenance.
- Behavior notes are private teacher records and are not included in standard exports unless explicitly selected.

## Screen map

| Route | Primary job | Key states |
| --- | --- | --- |
| `/setup` | Connect and verify Apps Script Web App | preparing, incompatible, diagnostic failure, ready |
| `/unlock` | Enter or replace PIN | incorrect, cooldown, expired, offline unavailable |
| `/today` | See current class and unfinished work | loading, empty day, offline, queued changes |
| `/quick-edit` | Update attendance/submission/score roster | saved, queued, partial sync, conflict, validation error |
| `/work` | Create, schedule, copy, and manage assignments | draft, open, due, reviewing, reviewed, archived |
| `/review` | Work through assignments due for review by room | not submitted, ready, reviewed, returned, complete |
| `/classes` | Browse teaching groups and rosters | empty, imported, archived |
| `/assessments` | Create and target work/exams | draft, open, locked, copied |
| `/gradebook` | Review totals and calculate grades | missing scores, invalid weights, preview, locked |
| `/behavior` | Review searchable behavior timeline | empty, filtered, attachment failure |
| `/reports` | Configure and request PDF/Excel | queued, running, ready, failed |
| `/settings` | Terms, thresholds, appearance, backup | re-auth required, validation, success |

## Quick Edit interaction contract

- Attendance defaults to `PRESENT` for the active roster; exceptions are explicit.
- Attendance control exposes all four labels (`PRESENT`, `LATE`, `ABSENT`, `LEAVE`) and never relies on color alone.
- Submission is a compact state control: `MISSING`, `SUBMITTED`, `LATE`, `EXEMPT`.
- Score accepts blank or a number from 0 through the assessment maximum. Blank is different from zero.
- Opening an item from the review queue selects its assessment, room, and review context automatically.
- A room is `REVIEWED` only when every non-exempt student has an explicit submission state and every submitted item has a valid total score.
- Batch selection can apply attendance or submission state to selected students.
- Every edit writes to the local outbox before optimistic display.
- A small bottom-edge status capsule shows saved, queued, retrying, conflict, or failed counts without blocking navigation.
- Undo is available for the most recent safe roster edit.

## Data model

Domain tables:

- `AcademicYears`
- `Terms`
- `GradeLevels`
- `Rooms`
- `Subjects`
- `TeachingGroups`
- `Students`
- `Enrollments`
- `ScheduleSlots`
- `AttendanceSessions`
- `AttendanceRecords`
- `AssessmentCategories`
- `Assessments`
- `AssessmentTargets`
- `SubmissionRecords`
- `ReviewBatches`
- `Scores`
- `GradeSchemes`
- `GradeThresholds`
- `FinalGrades`
- `BehaviorLogs`
- `ExportRequests`

System tables:

- `Settings`
- `Devices`
- `MutationLog`
- `JobQueue`
- `AuditLog`
- `SecurityLog`
- `FileRegistry`
- `SchemaMigrations`

Every mutable row uses a stable ID, version, created timestamp, updated timestamp, and soft-archive state where applicable. Row numbers are never treated as IDs.

## API contract outline

- `health`, `setup`, `verifyPin`, `reauthenticate`
- `bootstrap`, `syncPull`, `syncPush`
- `listToday`, `listTeachingGroups`, `getQuickEditRoster`
- `createAssessment`, `updateAssessment`, `copyAssessment`, `openAssessment`, `archiveAssessment`
- `listReviewQueue`, `startReviewBatch`, `completeReviewBatch`
- `previewGrades`, `lockGrades`, `unlockGrades`
- `requestExport`, `jobStatus`, `listExports`
- `connectionTest`

All actions use an allowlisted router and return a versioned envelope with `ok`, `data`, `error`, `requestId`, `serverTime`, and `apiVersion`.

## Mock data profile

- Academic year 2569, term 1.
- Grade levels ม.4, ม.5, ม.6.
- Two rooms per grade, 15 fictional students per room: 90 students total.
- One mathematics teaching group per room.
- Twenty attendance sessions with a realistic mix of present, late, absent, and leave.
- Four assignments, two quizzes, one midterm, and one final per grade level.
- Assignments distributed across draft, open, due-for-review, reviewing, and reviewed states.
- Mixed submitted, late, missing, and exempt records.
- Total scores containing complete, missing, zero, and intentionally invalid examples for validation testing.
- Positive and follow-up behavior notes.
- Standard 0–4 grade thresholds and weighted categories.
- Seed records carry `isMock=true`; setup never seeds without explicit consent.

## Data-volume assumptions

- Minimum: 1 grade, 1 room, 10 students, 1 subject.
- Typical: 3 grades, 6–12 rooms, 90–500 students, 2–5 subjects, 200 teaching sessions per year.
- Design ceiling for this storage version: 1,200 students, 30 teaching groups, and approximately 300,000 attendance records per academic year.
- Archive and delta-sync rules will prevent full-history reads on routine screens. The repository boundary allows storage migration if actual use exceeds the ceiling.

## File handling and notifications

- Student import accepts a documented Excel/CSV template and reports row-level errors before commit.
- PDF/Excel generation runs as a durable background job and stores finished files in an app-owned Drive folder.
- MVP notifications are in-app only: queued changes, sync conflict, export ready/failed, missing-score reminders, and upcoming assessment dates.
- Web Push is optional and excluded from MVP until a provider is approved and verified.

## Deployment assumptions

- Frontend: GitHub Pages repository URL; no custom domain for the first release.
- Backend: the supplied Apps Script project, linked only through an ignored local configuration file.
- Storage: a container-bound Google Sheet plus app-owned Drive folder.
- Deliverable: one personal deployment, structured so it can later be sanitized into a reusable template.
- Direct Apps Script transport remains provisional until the deployed `/exec` GET/POST/redirect spike passes on target browsers.

## Risks and controls

| Risk | Control |
| --- | --- |
| Accidental status changes in a dense grid | labeled controls, row confirmation feedback, undo, audit log |
| Blank score confused with zero | distinct visual and data states; validation before grade lock |
| Offline duplicate writes | durable outbox and immutable idempotency keys |
| Conflicting edits after reconnect | base version checks and explicit resolution UI |
| Slow PDF generation | durable export job outside the core save path |
| Exposed personal data | server authorization before reads; no sensitive service-worker API cache |
| Spreadsheet growth | batch access, delta sync, yearly archive, documented storage ceiling |

## Design directions for approval

1. **Classroom Focus (recommended):** calm teal/green accent, high legibility, comfortable touch density.
2. **Academic Navy:** scholarly navy with restrained amber accents and the densest desktop grid.
3. **Calm Workspace:** warm neutral surfaces with plum accent and slightly more breathing room.

All directions share Noto Sans Thai, semantic status tokens, 44px minimum touch targets, visible focus, tabular figures, System/Light/Dark/High Contrast support, and reduced-motion behavior.
