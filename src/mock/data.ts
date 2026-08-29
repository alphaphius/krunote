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
  ExportRequest,
  FinalGrade,
  GradeLevel,
  GradeThreshold,
  Room,
  ScheduleSlot,
  Score,
  Student,
  Subject,
  SubmissionRecord,
  TeachingGroup,
  TeacherLeave,
  Term,
} from '../domain/types'
import { gradeFor, weightedTotal } from '../domain/logic'

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
  const academicYears: AcademicYear[] = [record('year-2568', { name: '2568', startDate: '2025-05-01', endDate: '2026-03-31', active: false }),record('year-2569', { name: '2569', startDate: '2026-05-01', endDate: '2027-03-31', active: true })]
  const terms: Term[] = [record('term-2568-1', { academicYearId: 'year-2568', name: 'ภาคเรียนที่ 1', number: 1, startDate: '2025-05-01', endDate: '2025-10-15', active: false }),record('term-2569-1', { academicYearId: 'year-2569', name: 'ภาคเรียนที่ 1', number: 1, startDate: '2026-05-01', endDate: '2026-10-15', active: true })]
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
  const teacherLeaves: TeacherLeave[] = [
    record(`leave-${dateOffset(-11)}`, { date: dateOffset(-11), substituteName: 'ครูสมหญิง แสงดี', substitutePhone: '089-111-2233', reason: 'ลาป่วย', note: 'มอบหมายแบบฝึกหัดทบทวน' }),
    record(`leave-${dateOffset(3)}`, { date: dateOffset(3), substituteName: 'ครูสมชาย ใจดี', substitutePhone: '081-234-5678', reason: 'ลากิจส่วนตัว', note: 'ฝากใบงานไว้ที่ห้องพักครู' }),
    record(`leave-${dateOffset(18)}`, { date: dateOffset(18), substituteName: 'ครูกมลชนก ตั้งใจ', substitutePhone: '086-555-0188', reason: 'อบรมพัฒนาวิชาชีพ', note: 'สอนตามแผนการสอนบทที่ 4' }),
  ]

  const attendanceSessions: AttendanceSession[] = []
  const attendanceRecords: AttendanceRecord[] = []
  teachingGroups.forEach((group, groupIndex) => {
    for (let sessionIndex = 0; sessionIndex < 20; sessionIndex += 1) {
      const sessionId = `session-${group.id}-${sessionIndex + 1}`
      attendanceSessions.push(record(sessionId, { teachingGroupId: group.id, date: dateOffset(sessionIndex - 19), period: (groupIndex % 6) + 1 }))
      const roster = enrollments.filter((item) => item.teachingGroupId === group.id)
      roster.forEach((enrollment, studentIndex) => {
        const marker = (studentIndex + sessionIndex + groupIndex) % 31
        const status = studentIndex === 0 && sessionIndex % 4 === 0 ? 'ABSENT' : marker === 0 ? 'ABSENT' : marker === 7 ? 'LEAVE' : marker === 13 ? 'LATE' : 'PRESENT'
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
      ['สอบปลายภาค', 'FINAL', 'category-final', 40, 35, 'REVIEWED'],
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
          const shouldHaveScore = status === 'REVIEWED' || (status === 'REVIEWING' && studentIndex < 9) || (status === 'DUE' && studentIndex < 6)
          scores.push(record(`${assessmentId}:${enrollment.studentId}`, {
            assessmentId, studentId: enrollment.studentId,
            value: shouldHaveScore && !missing && !exempt ? Math.max(0, maxScore - ((studentIndex * 2 + assessmentIndex) % Math.max(3, Math.floor(maxScore / 2)))) : null,
          }))
        })
      })
    })
  })

  const behaviorLogs: BehaviorLog[] = teachingGroups.flatMap((group,groupIndex) => {
    const roster=enrollments.filter((item)=>item.teachingGroupId===group.id)
    return [
      record(`behavior-${groupIndex}-positive`, { studentId: roster[1].studentId, teachingGroupId: group.id, occurredAt: dateOffset(-groupIndex), sentiment: 'POSITIVE', category: 'HELPING', note: 'ช่วยอธิบายวิธีทำและแบ่งหน้าที่ในกลุ่มได้ดี' }),
      record(`behavior-${groupIndex}-follow`, { studentId: roster[4].studentId, teachingGroupId: group.id, occurredAt: dateOffset(-groupIndex-1), sentiment: 'FOLLOW_UP', category: 'RESPONSIBILITY', note: 'ควรติดตามงานที่ยังส่งไม่ครบและการเตรียมอุปกรณ์' }),
    ]
  })

  const gradeThresholds: GradeThreshold[] = [
    ['4', 80], ['3.5', 75], ['3', 70], ['2.5', 65], ['2', 60], ['1.5', 55], ['1', 50], ['0', 0],
  ].map(([grade, minScore], index) => record(`threshold-${grade}`, { termId: 'term-2569-1', grade: String(grade), minScore: Number(minScore), order: index + 1 }))
  const finalGrades: FinalGrade[] = teachingGroups.slice(0,2).flatMap((group)=>rosterForMock(group.id).map((studentId)=>{const targetIds=new Set(assessmentTargets.filter((item)=>item.teachingGroupId===group.id).map((item)=>item.assessmentId));const groupAssessments=assessments.filter((item)=>targetIds.has(item.id));const total=weightedTotal(studentId,groupAssessments,assessmentCategories,scores);return record(`final-${group.id}-${studentId}`,{teachingGroupId:group.id,studentId,total,grade:gradeFor(total,gradeThresholds),lockedAt:now})}))
  const exportRequests: ExportRequest[] = [record('export-sample-1',{format:'PDF',status:'SUCCEEDED',scope:'ROOM',teachingGroupIds:[teachingGroups[0].id],includeBehavior:false,fileName:'KruNote-ตัวอย่าง-ม4-1.pdf',fileUrl:'https://drive.google.com/'})]

  const currentGroups=[...teachingGroups]
  const previousGroups=currentGroups.map((current)=>record(`group-2568-${current.roomId}`,{termId:'term-2568-1',gradeLevelId:current.gradeLevelId,roomId:current.roomId,subjectId:current.subjectId,name:current.name}))
  previousGroups.forEach((previous,index)=>{
    teachingGroups.push(previous)
    scheduleSlots.push(record(`schedule-${previous.id}`,{teachingGroupId:previous.id,weekday:(index%5)+1,period:(index%6)+1,startTime:`${String(8+(index%6)).padStart(2,'0')}:30`,endTime:`${String(9+(index%6)).padStart(2,'0')}:20`}))
    const currentRoster=enrollments.filter((item)=>item.teachingGroupId===currentGroups[index].id)
    currentRoster.forEach((item)=>enrollments.push(record(`enrollment-${previous.id}-${item.studentId}`,{teachingGroupId:previous.id,studentId:item.studentId})))
    for(let sessionIndex=0;sessionIndex<5;sessionIndex+=1){const sessionId=`session-${previous.id}-history-${sessionIndex+1}`;const date=`2025-08-${String(4+sessionIndex*7).padStart(2,'0')}`;attendanceSessions.push(record(sessionId,{teachingGroupId:previous.id,date,period:(index%6)+1}));currentRoster.forEach((item,studentIndex)=>attendanceRecords.push(record(`${sessionId}:${item.studentId}`,{sessionId,studentId:item.studentId,status:studentIndex===0&&sessionIndex%2===0?'ABSENT':'PRESENT'})))}
  })
  const previousCategories:AssessmentCategory[]=[record('category-2568-work',{termId:'term-2568-1',name:'งานและการบ้าน',weight:40}),record('category-2568-exam',{termId:'term-2568-1',name:'แบบทดสอบและสอบ',weight:60})]
  assessmentCategories.push(...previousCategories)
  gradeLevels.forEach((grade)=>{const assessmentId=`assessment-2568-${grade.code}`;assessments.push(record(assessmentId,{termId:'term-2568-1',gradeLevelId:grade.id,subjectId:'subject-math',categoryId:'category-2568-exam',title:'สอบปลายภาค 2568',type:'FINAL',status:'REVIEWED',assignedAt:'2025-09-15',dueAt:'2025-09-30',maxScore:40}));previousGroups.filter((item)=>item.gradeLevelId===grade.id).forEach((previous)=>{assessmentTargets.push(record(`target-${assessmentId}-${previous.id}`,{assessmentId,teachingGroupId:previous.id}));enrollments.filter((item)=>item.teachingGroupId===previous.id).forEach((item,index)=>{submissions.push(record(`${assessmentId}:${item.studentId}`,{assessmentId,studentId:item.studentId,status:'SUBMITTED',submittedAt:'2025-09-30'}));scores.push(record(`${assessmentId}:${item.studentId}`,{assessmentId,studentId:item.studentId,value:Math.max(18,38-index)}))})})})
  const previousThresholds:GradeThreshold[]=[['4',80],['3.5',75],['3',70],['2.5',65],['2',60],['1.5',55],['1',50],['0',0]].map(([grade,minScore],index)=>record(`threshold-2568-${grade}`,{termId:'term-2568-1',grade:String(grade),minScore:Number(minScore),order:index+1}))
  gradeThresholds.push(...previousThresholds)
  teacherLeaves.push(record('leave-2025-08-18',{date:'2025-08-18',substituteName:'ครูสมหญิง แสงดี',substitutePhone:'089-111-2233',reason:'ลาป่วย',note:'ข้อมูลตัวอย่างปี 2568'}))
  behaviorLogs.push(record('behavior-2568-sample',{studentId:students[0].id,teachingGroupId:previousGroups[0].id,occurredAt:'2025-08-20T03:00:00.000Z',sentiment:'POSITIVE',category:'LEARNING',note:'ตั้งใจเรียนและส่งงานครบในปีการศึกษา 2568'}))

  function rosterForMock(groupId:string){return enrollments.filter((item)=>item.teachingGroupId===groupId).map((item)=>item.studentId)}

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
    teacherLeaves,
    attendanceSessions,
    attendanceRecords,
    assessmentCategories,
    assessments,
    assessmentTargets,
    submissions,
    scores,
    behaviorLogs,
    gradeThresholds,
    finalGrades,
    exportRequests,
  }
}
