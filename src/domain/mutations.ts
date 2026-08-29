import type {
  Assessment,
  AssessmentCategory,
  AssessmentTarget,
  AttendanceRecord,
  AttendanceSession,
  BehaviorLog,
  BootstrapData,
  DomainMutation,
  Score,
  SubmissionRecord,
  FinalGrade,
  Enrollment,
  Room,
  ScheduleSlot,
  Student,
  TeacherLeave,
  TeachingGroup,
} from './types'

function upsert<T extends { id: string }>(items: T[], record: T): T[] {
  const index = items.findIndex((item) => item.id === record.id)
  if (index < 0) return [...items, record]
  const next = [...items]
  next[index] = record
  return next
}

export function applyLocalMutation(data: BootstrapData, mutation: DomainMutation): BootstrapData {
  const now = new Date().toISOString()
  switch (mutation.action) {
    case 'attendance.session.upsert': {
      const payload = mutation.payload as { session: AttendanceSession; records: AttendanceRecord[] }
      return {
        ...data,
        attendanceSessions: upsert(data.attendanceSessions, payload.session),
        attendanceRecords: payload.records.reduce((items, record) => upsert(items, record), data.attendanceRecords),
      }
    }
    case 'attendance.update': {
      const payload = mutation.payload as Pick<AttendanceRecord, 'id' | 'sessionId' | 'studentId' | 'status' | 'note'>
      const current = data.attendanceRecords.find((record) => record.id === payload.id)
      const record: AttendanceRecord = {
        ...payload,
        version: (current?.version ?? 0) + 1,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      }
      return { ...data, attendanceRecords: upsert(data.attendanceRecords, record) }
    }
    case 'submission.update': {
      const payload = mutation.payload as Pick<SubmissionRecord, 'id' | 'assessmentId' | 'studentId' | 'status' | 'submittedAt'>
      const current = data.submissions.find((record) => record.id === payload.id)
      const record: SubmissionRecord = {
        ...payload,
        version: (current?.version ?? 0) + 1,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      }
      return { ...data, submissions: upsert(data.submissions, record) }
    }
    case 'score.update': {
      const payload = mutation.payload as Pick<Score, 'id' | 'assessmentId' | 'studentId' | 'value' | 'feedback'>
      const current = data.scores.find((record) => record.id === payload.id)
      const record: Score = {
        ...payload,
        version: (current?.version ?? 0) + 1,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      }
      return { ...data, scores: upsert(data.scores, record) }
    }
    case 'behavior.create': {
      const payload = mutation.payload as BehaviorLog
      return { ...data, behaviorLogs: upsert(data.behaviorLogs, payload) }
    }
    case 'assessment.create':
    case 'assessment.update': {
      const payload = mutation.payload as Assessment | { assessment: Assessment; targets: AssessmentTarget[] }
      if ('assessment' in payload) {
        return {
          ...data,
          assessments: upsert(data.assessments, payload.assessment),
          assessmentTargets: payload.targets.reduce((items, target) => upsert(items, target), data.assessmentTargets),
        }
      }
      return { ...data, assessments: upsert(data.assessments, payload) }
    }
    case 'assessmentCategories.replace': {
      const payload = mutation.payload as { records: AssessmentCategory[]; deletedIds: string[] }
      const retained = data.assessmentCategories.filter((item) => !payload.deletedIds.includes(item.id))
      return { ...data, assessmentCategories: payload.records.reduce((items, record) => upsert(items, { ...record, version: record.version + 1, updatedAt: now }), retained) }
    }
    case 'room.create': {
      const payload = mutation.payload as { room: Room; group: TeachingGroup; scheduleSlot?: ScheduleSlot }
      return {
        ...data,
        rooms: upsert(data.rooms, { ...payload.room, version: payload.room.version + 1, updatedAt: now }),
        teachingGroups: upsert(data.teachingGroups, { ...payload.group, version: payload.group.version + 1, updatedAt: now }),
        scheduleSlots: payload.scheduleSlot ? upsert(data.scheduleSlots, { ...payload.scheduleSlot, version: payload.scheduleSlot.version + 1, updatedAt: now }) : data.scheduleSlots,
      }
    }
    case 'students.import': {
      const payload = mutation.payload as { students: Student[]; enrollments: Enrollment[] }
      return {
        ...data,
        students: payload.students.reduce((items, record) => upsert(items, { ...record, version: record.version + 1, updatedAt: now }), data.students),
        enrollments: payload.enrollments.reduce((items, record) => upsert(items, { ...record, version: record.version + 1, updatedAt: now }), data.enrollments),
      }
    }
    case 'grades.lock': {
      const payload = mutation.payload as { records: FinalGrade[] }
      return { ...data, finalGrades: payload.records.reduce((items, grade) => upsert(items, grade), data.finalGrades) }
    }
    case 'teacherLeave.create':
    case 'teacherLeave.update': {
      const payload = mutation.payload as TeacherLeave
      const leaves = data.teacherLeaves ?? []
      const current = leaves.find((record) => record.id === payload.id)
      const record: TeacherLeave = {
        ...payload,
        version: (current?.version ?? 0) + 1,
        createdAt: current?.createdAt ?? payload.createdAt ?? now,
        updatedAt: now,
      }
      return { ...data, teacherLeaves: upsert(leaves, record) }
    }
    default:
      return data
  }
}
