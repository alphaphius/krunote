import type {
  AcademicYear,
  Assessment,
  AssessmentCategory,
  AssessmentTarget,
  AttendanceRecord,
  AttendanceSession,
  BehaviorLog,
  BootstrapData,
  Enrollment,
  GradeLevel,
  GradeThreshold,
  Room,
  ScheduleSlot,
  Score,
  Student,
  Subject,
  SubmissionRecord,
  TeachingGroup,
  Term,
} from '../domain/types'

const firstNames = ['กิตติพงษ์', 'ณัฐชา', 'ปกรณ์', 'ชลธิชา', 'ธนกฤต', 'พิมพ์ชนก', 'ภูริณัฐ', 'วรัญญา', 'ศุภกร', 'สิรินดา', 'อชิรญา', 'กมลชนก', 'นราวิชญ์', 'ปุณณภพ', 'รินรดา']
const lastNames = ['ใจดี', 'สุขใจ', 'แสงทอง', 'คำดี', 'บุญช่วย', 'วงศ์สวัสดิ์', 'ตั้งใจ', 'ศรีสุข', 'พิพัฒน์กุล', 'พรประเสริฐ', 'สุขเกษม', 'รัตนวงศ์', 'ชูศักดิ์', 'มั่นคง', 'สินสมบูรณ์']
const nicknames = ['ต้น', 'มิ้น', 'เกม', 'แพรว', 'นนท์', 'มุก', 'ภูมิ', 'ใบหม่อน', 'กล้า', 'ขิม', 'ออม', 'ฟ้า', 'ไนท์', 'ปัน', 'ริน']

const now = new Date().toISOString()
const record = <T extends object>(id: string, value: T) => ({ id, version: 1, createdAt: now, updatedAt: now, isMock: true, ...value })

function dateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function createMockData(): BootstrapData {
  const academicYears: AcademicYear[] = [record('year-2569', { name: '2569', startDate: '2026-05-01', endDate: '2027-03-31', active: true })]
  const terms: Term[] = [record('term-2569-1', { academicYearId: 'year-2569', name: 'ภาคเรียนที่ 1', number: 1, startDate: '2026-05-01', endDate: '2026-10-15', active: true })]
  const gradeLevels: GradeLevel[] = [4, 5, 6].map((level, index) => record(`grade-${level}`, { code: `M${level}`, name: `ม.${level}`, order: index + 1 }))
  const rooms: Room[] = gradeLevels.flatMap((grade) => [1, 2].map((room) => record(`room-${grade.code}-${room}`, { gradeLevelId: grade.id, code: `${grade.code}/${room}`, name: `${grade.name}/${room}` })))
  const subjects: Subject[] = [record('subject-math', { code: 'ค31101', name: 'คณิตศาสตร์' })]
  const teachingGroups: TeachingGroup[] = rooms.map((room) => {
    const grade = gradeLevels.find((item) => item.id === room.gradeLevelId)!
    return record(`group-${room.code}`, { termId: 'term-2569-1', gradeLevelId: grade.id, roomId: room.id, subjectId: 'subject-math', name: `คณิตศาสตร์ ${room.name}` })
  })

  const students: Student[] = []
  const enrollments: Enrollment[] = []
  rooms.forEach((room, roomIndex) => {
    const group = teachingGroups[roomIndex]
    for (let index = 0; index < 15; index += 1) {
      const studentIndex = roomIndex * 15 + index
      const studentId = `student-${studentIndex + 1}`
      students.push(record(studentId, {
        studentCode: `${room.code.replace(/\D/g, '')}${String(index + 1).padStart(2, '0')}`,
        number: index + 1,
        title: index % 2 ? 'นางสาว' : 'นาย',
        firstName: firstNames[index],
        lastName: lastNames[(index + roomIndex) % lastNames.length],
        nickname: nicknames[index],
        active: true,
        privateNote: index === 4 ? 'ติดตามงานที่ยังไม่ครบ' : '',
      }))
      enrollments.push(record(`enrollment-${group.id}-${studentId}`, { teachingGroupId: group.id, studentId }))
    }
  })

  const scheduleSlots: ScheduleSlot[] = teachingGroups.map((group, index) => record(`schedule-${group.id}`, {
    teachingGroupId: group.id,
    weekday: (index % 5) + 1,
    period: (index % 6) + 1,
    startTime: `${String(8 + (index % 6)).padStart(2, '0')}:30`,
    endTime: `${String(9 + (index % 6)).padStart(2, '0')}:20`,
  }))

  const attendanceSessions: AttendanceSession[] = []
  const attendanceRecords: AttendanceRecord[] = []
  teachingGroups.forEach((group, groupIndex) => {
    for (let sessionIndex = 0; sessionIndex < 20; sessionIndex += 1) {
      const sessionId = `session-${group.id}-${sessionIndex + 1}`
      attendanceSessions.push(record(sessionId, { teachingGroupId: group.id, date: dateOffset(sessionIndex - 19), period: (groupIndex % 6) + 1 }))
      const roster = enrollments.filter((item) => item.teachingGroupId === group.id)
      roster.forEach((enrollment, studentIndex) => {
        const marker = (studentIndex + sessionIndex + groupIndex) % 31
        const status = marker === 0 ? 'ABSENT' : marker === 7 ? 'LEAVE' : marker === 13 ? 'LATE' : 'PRESENT'
        attendanceRecords.push(record(`${sessionId}:${enrollment.studentId}`, { sessionId, studentId: enrollment.studentId, status }))
      })
    }
  })

  const assessmentCategories: AssessmentCategory[] = [
    record('category-work', { termId: 'term-2569-1', name: 'งานและการบ้าน', weight: 30 }),
    record('category-quiz', { termId: 'term-2569-1', name: 'แบบทดสอบ', weight: 20 }),
    record('category-midterm', { termId: 'term-2569-1', name: 'กลางภาค', weight: 20 }),
    record('category-final', { termId: 'term-2569-1', name: 'ปลายภาค', weight: 30 }),
  ]

  const assessments: Assessment[] = []
  const assessmentTargets: AssessmentTarget[] = []
  const submissions: SubmissionRecord[] = []
  const scores: Score[] = []
  gradeLevels.forEach((grade, gradeIndex) => {
    const gradeGroups = teachingGroups.filter((group) => group.gradeLevelId === grade.id)
    const definitions = [
      ['การบ้านบทที่ 1', 'ASSIGNMENT', 'category-work', 20, -24, 'REVIEWED'],
      ['การบ้านบทที่ 2', 'ASSIGNMENT', 'category-work', 20, -14, 'REVIEWING'],
      ['แบบฝึกหัดประยุกต์', 'WORK', 'category-work', 15, -2, 'DUE'],
      ['ชิ้นงานสรุปบท', 'WORK', 'category-work', 25, 5, 'OPEN'],
      ['แบบทดสอบย่อย 1', 'QUIZ', 'category-quiz', 10, -18, 'REVIEWED'],
      ['แบบทดสอบย่อย 2', 'QUIZ', 'category-quiz', 10, -6, 'REVIEWING'],
      ['สอบกลางภาค', 'MIDTERM', 'category-midterm', 30, -10, 'REVIEWED'],
      ['สอบปลายภาค', 'FINAL', 'category-final', 40, 35, 'DRAFT'],
    ] as const
    definitions.forEach(([title, type, categoryId, maxScore, dueOffset, status], assessmentIndex) => {
      const assessmentId = `assessment-${grade.code}-${assessmentIndex + 1}`
      assessments.push(record(assessmentId, {
        termId: 'term-2569-1', gradeLevelId: grade.id, subjectId: 'subject-math', categoryId,
        title, type, status, assignedAt: dateOffset(dueOffset - 7), dueAt: dateOffset(dueOffset), maxScore,
        instructions: 'ส่งตามกำหนดและแสดงวิธีทำให้ครบ',
      }))
      gradeGroups.forEach((group) => {
        assessmentTargets.push(record(`target-${assessmentId}-${group.id}`, { assessmentId, teachingGroupId: group.id }))
        const roster = enrollments.filter((item) => item.teachingGroupId === group.id)
        roster.forEach((enrollment, studentIndex) => {
          const missing = (studentIndex + assessmentIndex + gradeIndex) % 13 === 0
          const late = !missing && (studentIndex + assessmentIndex) % 9 === 0
          const exempt = assessmentIndex === 5 && studentIndex === 14
          const submissionStatus = exempt ? 'EXEMPT' : missing ? 'MISSING' : late ? 'LATE' : 'SUBMITTED'
          submissions.push(record(`${assessmentId}:${enrollment.studentId}`, {
            assessmentId, studentId: enrollment.studentId, status: submissionStatus,
            submittedAt: submissionStatus === 'SUBMITTED' || submissionStatus === 'LATE' ? dateOffset(dueOffset + (late ? 1 : -1)) : undefined,
          }))
          const shouldHaveScore = status === 'REVIEWED' || (status === 'REVIEWING' && studentIndex < 9)
          scores.push(record(`${assessmentId}:${enrollment.studentId}`, {
            assessmentId, studentId: enrollment.studentId,
            value: shouldHaveScore && !missing && !exempt ? Math.max(0, maxScore - ((studentIndex * 2 + assessmentIndex) % Math.max(3, Math.floor(maxScore / 2)))) : null,
          }))
        })
      })
    })
  })

  const behaviorLogs: BehaviorLog[] = [
    record('behavior-1', { studentId: 'student-1', teachingGroupId: teachingGroups[0].id, occurredAt: now, sentiment: 'POSITIVE', category: 'HELPING', note: 'ช่วยอธิบายวิธีทำให้เพื่อนในกลุ่ม' }),
    record('behavior-2', { studentId: 'student-5', teachingGroupId: teachingGroups[0].id, occurredAt: now, sentiment: 'FOLLOW_UP', category: 'RESPONSIBILITY', note: 'ยังส่งงานไม่ครบ 2 รายการ' }),
  ]

  const gradeThresholds: GradeThreshold[] = [
    ['4', 80], ['3.5', 75], ['3', 70], ['2.5', 65], ['2', 60], ['1.5', 55], ['1', 50], ['0', 0],
  ].map(([grade, minScore], index) => record(`threshold-${grade}`, { termId: 'term-2569-1', grade: String(grade), minScore: Number(minScore), order: index + 1 }))

  return {
    serverTime: now,
    cursor: now,
    academicYears,
    terms,
    gradeLevels,
    rooms,
    subjects,
    teachingGroups,
    students,
    enrollments,
    scheduleSlots,
    attendanceSessions,
    attendanceRecords,
    assessmentCategories,
    assessments,
    assessmentTargets,
    submissions,
    scores,
    behaviorLogs,
    gradeThresholds,
    finalGrades: [],
    exportRequests: [],
  }
}
