import type {
  Assessment,
  AssessmentCategory,
  AssessmentTarget,
  BootstrapData,
  Enrollment,
  GradeThreshold,
  Score,
  Student,
  SubmissionRecord,
  TeachingGroup,
} from './types'

export function gradeFor(total: number, thresholds: GradeThreshold[]): string {
  return [...thresholds]
    .sort((a, b) => b.minScore - a.minScore)
    .find((threshold) => total >= threshold.minScore)?.grade ?? '0'
}

export function validateScore(value: number | null, maxScore: number): string | null {
  if (value === null) return null
  if (!Number.isFinite(value)) return 'คะแนนต้องเป็นตัวเลข'
  if (value < 0) return 'คะแนนต้องไม่ต่ำกว่า 0'
  if (value > maxScore) return `คะแนนต้องไม่เกิน ${maxScore}`
  return null
}

export function rosterForGroup(data: BootstrapData, teachingGroupId: string): Student[] {
  const studentIds = new Set(
    data.enrollments
      .filter((enrollment) => enrollment.teachingGroupId === teachingGroupId && !enrollment.archived)
      .map((enrollment) => enrollment.studentId),
  )
  return data.students
    .filter((student) => student.active && studentIds.has(student.id))
    .sort((a, b) => a.number - b.number)
}

export function groupsForAssessment(
  assessmentId: string,
  targets: AssessmentTarget[],
  groups: TeachingGroup[],
): TeachingGroup[] {
  const groupIds = new Set(targets.filter((target) => target.assessmentId === assessmentId).map((target) => target.teachingGroupId))
  return groups.filter((group) => groupIds.has(group.id))
}

export function reviewProgress(
  assessment: Assessment,
  group: TeachingGroup,
  enrollments: Enrollment[],
  submissions: SubmissionRecord[],
  scores: Score[],
): { reviewed: number; total: number; complete: boolean } {
  const studentIds = enrollments.filter((item) => item.teachingGroupId === group.id).map((item) => item.studentId)
  const total = studentIds.length
  let reviewed = 0
  for (const studentId of studentIds) {
    const submission = submissions.find((item) => item.assessmentId === assessment.id && item.studentId === studentId)
    const score = scores.find((item) => item.assessmentId === assessment.id && item.studentId === studentId)
    if (submission?.status === 'EXEMPT') reviewed += 1
    else if (submission && submission.status !== 'MISSING' && score && validateScore(score.value, assessment.maxScore) === null) reviewed += 1
    else if (submission?.status === 'MISSING') reviewed += 1
  }
  return { reviewed, total, complete: total > 0 && reviewed === total }
}

export function weightedTotal(
  studentId: string,
  assessments: Assessment[],
  categories: AssessmentCategory[],
  scores: Score[],
): number {
  const activeAssessments = assessments.filter((assessment) => assessment.status !== 'DRAFT' && assessment.status !== 'ARCHIVED')
  let total = 0
  for (const category of categories) {
    const categoryAssessments = activeAssessments.filter((assessment) => assessment.categoryId === category.id)
    const possible = categoryAssessments.reduce((sum, assessment) => sum + assessment.maxScore, 0)
    if (!possible) continue
    const earned = categoryAssessments.reduce((sum, assessment) => {
      const score = scores.find((item) => item.assessmentId === assessment.id && item.studentId === studentId)
      return sum + (score?.value ?? 0)
    }, 0)
    total += (earned / possible) * category.weight
  }
  return Math.round(total * 100) / 100
}
