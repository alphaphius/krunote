import { describe, expect, it } from 'vitest'
import { gradeFor, rosterForGroup, validateScore, weightedTotal } from '../src/domain/logic'
import { createMockData } from '../src/mock/data'
import { applyLocalMutation } from '../src/domain/mutations'

describe('gradebook domain', () => {
  it('creates six rooms and 90 fictional students', () => { const data=createMockData(); expect(data.teachingGroups).toHaveLength(6); expect(data.students).toHaveLength(90); expect(rosterForGroup(data,data.teachingGroups[0].id)).toHaveLength(15) })
  it('validates total scores without turning blank into zero', () => { expect(validateScore(null,10)).toBeNull(); expect(validateScore(11,10)).toContain('10'); expect(validateScore(-1,10)).not.toBeNull() })
  it('calculates grade thresholds and weighted totals', () => { const data=createMockData(); expect(gradeFor(79,data.gradeThresholds)).toBe('3.5'); const student=data.students[0]; expect(weightedTotal(student.id,data.assessments,data.assessmentCategories,data.scores)).toBeGreaterThanOrEqual(0) })
  it('applies an attendance mutation optimistically', () => { const data=createMockData(); const current=data.attendanceRecords[0]; const next=applyLocalMutation(data,{ id:'mutation-1',entity:'AttendanceRecord',action:'attendance.update',baseVersion:current.version,createdAt:new Date().toISOString(),payload:{...current,status:'ABSENT'} }); expect(next.attendanceRecords.find((item)=>item.id===current.id)?.status).toBe('ABSENT') })
})
