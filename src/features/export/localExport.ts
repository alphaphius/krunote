import type { BootstrapData, TeachingGroup } from '../../domain/types'
import { gradeFor, rosterForGroup, weightedTotal } from '../../domain/logic'

function safeName(value: string): string { return value.replace(/[\\/:*?"<>|]/g, '-').trim() }
function groupRows(data: BootstrapData, group: TeachingGroup) {
  const targetIds = new Set(data.assessmentTargets.filter((item) => item.teachingGroupId === group.id).map((item) => item.assessmentId))
  const assessments = data.assessments.filter((item) => targetIds.has(item.id) && !item.archived)
  return rosterForGroup(data, group.id).map((student) => {
    const total = weightedTotal(student.id, assessments, data.assessmentCategories, data.scores)
    return { student, total, grade: gradeFor(total, data.gradeThresholds), assessments }
  })
}

export async function exportExcel(data: BootstrapData, groups: TeachingGroup[]): Promise<void> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook(); workbook.creator = 'KruNote'; workbook.created = new Date()
  for (const group of groups) {
    const sheet = workbook.addWorksheet(safeName(group.name).slice(0, 31))
    const rows = groupRows(data, group); const assessments = rows[0]?.assessments ?? []
    sheet.columns = [
      { header: 'เลขที่', key: 'number', width: 8 }, { header: 'รหัสนักเรียน', key: 'studentCode', width: 16 },
      { header: 'ชื่อ-นามสกุล', key: 'name', width: 28 }, { header: 'ชื่อเล่น', key: 'nickname', width: 14 },
      ...assessments.map((item) => ({ header: `${item.title} (${item.maxScore})`, key: item.id, width: 18 })),
      { header: 'คะแนนรวม', key: 'total', width: 13 }, { header: 'เกรด', key: 'grade', width: 9 },
    ]
    rows.forEach(({ student, total, grade }) => sheet.addRow({ number: student.number, studentCode: student.studentCode, name: `${student.title}${student.firstName} ${student.lastName}`, nickname: student.nickname, ...Object.fromEntries(assessments.map((item) => [item.id, data.scores.find((score) => score.assessmentId === item.id && score.studentId === student.id)?.value ?? ''])), total, grade }))
    sheet.views = [{ state: 'frozen', ySplit: 1 }]; sheet.autoFilter = { from: 'A1', to: sheet.getCell(1, sheet.columnCount).address }
    sheet.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166B59' } }; cell.alignment = { vertical: 'middle', horizontal: 'center' } })
    sheet.getRow(1).height = 28; sheet.eachRow((row, index) => { if (index > 1 && index % 2 === 1) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF2F0' } } }) })
  }
  const buffer = await workbook.xlsx.writeBuffer(); const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `KruNote-${new Date().toISOString().slice(0, 10)}.xlsx`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportPdf(data: BootstrapData, groups: TeachingGroup[]): void {
  const sections = groups.map((group) => `<section><h1>${group.name}</h1><p>รายงานคะแนน ณ ${new Date().toLocaleString('th-TH')}</p><table><thead><tr><th>เลขที่</th><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ชื่อเล่น</th><th>รวม</th><th>เกรด</th></tr></thead><tbody>${groupRows(data, group).map(({ student, total, grade }) => `<tr><td>${student.number}</td><td>${student.studentCode}</td><td>${student.title}${student.firstName} ${student.lastName}</td><td>${student.nickname}</td><td>${total.toFixed(2)}</td><td>${grade}</td></tr>`).join('')}</tbody></table></section>`).join('')
  const popup = window.open('', '_blank', 'noopener,noreferrer'); if (!popup) throw new Error('กรุณาอนุญาตหน้าต่างป๊อปอัปเพื่อสร้าง PDF')
  popup.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>KruNote รายงานคะแนน</title><style>@page{size:A4;margin:12mm}body{font-family:system-ui,sans-serif;color:#17211e}section{page-break-after:always}h1{margin:0;color:#166b59}p{margin:.25rem 0 1rem}table{border-collapse:collapse;width:100%;font-size:11pt}th,td{border:1px solid #b7c5bf;padding:6px;text-align:left}th{background:#d5eee7}td:nth-last-child(-n+2),th:nth-last-child(-n+2){text-align:center}</style></head><body>${sections}<script>window.onload=()=>window.print()<\/script></body></html>`); popup.document.close()
}
