# KruNote Product Contract

## Audience

A Thai secondary-school teacher who teaches multiple grade levels and rooms and needs one private tool for attendance, assignment review, total-score entry, behavior notes, grading, and reports.

## Core promise

KruNote keeps the whole roster editable from one screen. The teacher records exceptions, reviews work, and enters scores without opening students one at a time.

## Product voice

- Thai-first, plain, calm, and specific.
- Buttons describe the outcome: `สร้างและเปิดรับงาน`, `เริ่มตรวจ`, `ล็อกเกรด`.
- Progress copy states the real operation: `บันทึกไว้ในเครื่องแล้ว`, `กำลังสร้าง PDF`.
- Errors explain what happened and the next action.

## Primary jobs

1. Mark attendance for one teaching session.
2. Create work for one or many rooms.
3. Review submissions and total scores for the whole room.
4. Add a short behavior record.
5. Calculate, validate, and lock grades.
6. Export PDF or Excel for one room, one grade, selected rooms, or all rooms.

## Guardrails

- Blank score and zero score are different states.
- Behavior records do not affect grades by default.
- Protected student data is fetched only after server authorization.
- Offline writes are queued, encrypted, idempotent, and server-validated on sync.
- Export completion is reported only after the background job succeeds.
- The initial PIN `1234` is setup-only and must be replaced.

## Capacity target

- Typical: 90-500 students, 6-12 rooms, 2-5 subjects.
- Supported design ceiling: 1,200 students, 30 teaching groups, and approximately 300,000 attendance records per academic year.

## Success criteria

- Attendance for 40-50 students can be completed in under two minutes.
- Every tap receives visible feedback without blocking unrelated navigation.
- Offline edits survive reload and reconnect without duplicate records.
- Grades and exports are reproducible from stored source records.
