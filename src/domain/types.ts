export type Locale = 'th' | 'en'
export type ThemePreference = 'system' | 'light' | 'dark' | 'contrast'
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
export type SubmissionStatus = 'SUBMITTED' | 'LATE' | 'MISSING' | 'EXEMPT'
export type AssessmentType = 'ASSIGNMENT' | 'WORK' | 'QUIZ' | 'MIDTERM' | 'FINAL' | 'OTHER'
export type AssessmentStatus = 'DRAFT' | 'OPEN' | 'DUE' | 'REVIEWING' | 'REVIEWED' | 'ARCHIVED'
export type ExportFormat = 'PDF' | 'XLSX'
export type ExportStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'

export interface VersionedRecord {
  id: string
  version: number
  createdAt: string
  updatedAt: string
  archived?: boolean
  isMock?: boolean
}

export interface AcademicYear extends VersionedRecord {
  name: string
  startDate: string
  endDate: string
  active: boolean
}

export interface Term extends VersionedRecord {
  academicYearId: string
  name: string
  number: number
  startDate: string
  endDate: string
  active: boolean
}

export interface GradeLevel extends VersionedRecord {
  code: string
  name: string
  order: number
}

export interface Room extends VersionedRecord {
  gradeLevelId: string
  code: string
  name: string
}

export interface Subject extends VersionedRecord {
  code: string
  name: string
}

export interface TeachingGroup extends VersionedRecord {
  termId: string
  gradeLevelId: string
  roomId: string
  subjectId: string
  name: string
}

export interface Student extends VersionedRecord {
  studentCode: string
  number: number
  title: string
  firstName: string
  lastName: string
  nickname: string
  active: boolean
  privateNote?: string
}

export interface Enrollment extends VersionedRecord {
  teachingGroupId: string
  studentId: string
}

export interface ScheduleSlot extends VersionedRecord {
  teachingGroupId: string
  weekday: number
  period: number
  startTime: string
  endTime: string
}

export interface TeacherLeave extends VersionedRecord {
  date: string
  substituteName: string
  substitutePhone: string
  reason: string
  note?: string
}

export interface AttendanceSession extends VersionedRecord {
  teachingGroupId: string
  date: string
  period: number
  note?: string
}

export interface AttendanceRecord extends VersionedRecord {
  sessionId: string
  studentId: string
  status: AttendanceStatus
  note?: string
}

export interface AssessmentCategory extends VersionedRecord {
  termId: string
  name: string
  weight: number
}

export interface Assessment extends VersionedRecord {
  termId: string
  gradeLevelId: string
  subjectId: string
  categoryId: string
  title: string
  type: AssessmentType
  status: AssessmentStatus
  assignedAt: string
  dueAt: string
  maxScore: number
  instructions?: string
}

export interface AssessmentTarget extends VersionedRecord {
  assessmentId: string
  teachingGroupId: string
}

export interface SubmissionRecord extends VersionedRecord {
  assessmentId: string
  studentId: string
  status: SubmissionStatus
  submittedAt?: string
}

export interface Score extends VersionedRecord {
  assessmentId: string
  studentId: string
  value: number | null
  feedback?: string
}

export interface BehaviorLog extends VersionedRecord {
  studentId: string
  teachingGroupId: string
  occurredAt: string
  sentiment: 'POSITIVE' | 'FOLLOW_UP'
  category: 'LEARNING' | 'RESPONSIBILITY' | 'DISCIPLINE' | 'HELPING' | 'OTHER'
  note: string
}

export interface GradeThreshold extends VersionedRecord {
  termId: string
  grade: string
  minScore: number
  order: number
}

export interface FinalGrade extends VersionedRecord {
  teachingGroupId: string
  studentId: string
  total: number
  grade: string
  lockedAt?: string
}

export interface ExportRequest extends VersionedRecord {
  format: ExportFormat
  status: ExportStatus
  scope: 'ROOM' | 'GRADE' | 'SELECTED' | 'ALL'
  teachingGroupIds: string[]
  includeBehavior: boolean
  fileName?: string
  fileUrl?: string
  error?: string
}

export interface BootstrapData {
  serverTime: string
  cursor: string
  academicYears: AcademicYear[]
  terms: Term[]
  gradeLevels: GradeLevel[]
  rooms: Room[]
  subjects: Subject[]
  teachingGroups: TeachingGroup[]
  students: Student[]
  enrollments: Enrollment[]
  scheduleSlots: ScheduleSlot[]
  teacherLeaves: TeacherLeave[]
  attendanceSessions: AttendanceSession[]
  attendanceRecords: AttendanceRecord[]
  assessmentCategories: AssessmentCategory[]
  assessments: Assessment[]
  assessmentTargets: AssessmentTarget[]
  submissions: SubmissionRecord[]
  scores: Score[]
  behaviorLogs: BehaviorLog[]
  gradeThresholds: GradeThreshold[]
  finalGrades: FinalGrade[]
  exportRequests: ExportRequest[]
}

export type MutationAction =
  | 'attendance.session.upsert'
  | 'attendance.update'
  | 'submission.update'
  | 'score.update'
  | 'behavior.create'
  | 'assessment.create'
  | 'assessment.update'
  | 'assessmentCategories.replace'
  | 'room.create'
  | 'students.import'
  | 'teacherLeave.create'
  | 'teacherLeave.update'
  | 'grades.lock'

export interface DomainMutation<T = unknown> {
  id: string
  entity: string
  action: MutationAction
  payload: T
  baseVersion: number
  createdAt: string
}

export interface ApiEnvelope<T> {
  ok: boolean
  data?: T
  error?: { code: string; message: string; details?: unknown }
  requestId: string
  serverTime: string
  apiVersion: string
}

export interface SessionInfo {
  token: string
  expiresAt: string
  mustChangePin: boolean
  privileged?: boolean
}
