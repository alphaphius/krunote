export interface RosterImportRow {
  studentCode: string
  number: number
  title: string
  firstName: string
  lastName: string
  nickname: string
  privateNote: string
}

const aliases: Record<keyof RosterImportRow, string[]> = {
  studentCode: ['รหัสนักเรียน', 'รหัส', 'studentcode', 'student code'],
  number: ['เลขที่', 'number', 'no'],
  title: ['คำนำหน้า', 'title'],
  firstName: ['ชื่อ', 'ชื่อจริง', 'firstname', 'first name'],
  lastName: ['นามสกุล', 'lastname', 'last name'],
  nickname: ['ชื่อเล่น', 'nickname'],
  privateNote: ['หมายเหตุ', 'บันทึก', 'note'],
}

function text(value: unknown): string { return String(value ?? '').trim() }
function normalized(value: unknown): string { return text(value).toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ') }

export function parseRosterRows(rows: unknown[][]): RosterImportRow[] {
  if (!rows.length) throw new Error('ไม่พบข้อมูลในไฟล์ Excel')
  const headers = rows[0].map(normalized)
  const indexes = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, headers.findIndex((header) => names.includes(header))])) as Record<keyof RosterImportRow, number>
  const missing = (['studentCode', 'number', 'firstName', 'lastName'] as const).filter((key) => indexes[key] < 0)
  if (missing.length) throw new Error('หัวตารางไม่ครบ กรุณาใช้ไฟล์ตัวอย่างจากระบบ')
  const result = rows.slice(1).filter((row) => row.some((cell) => text(cell))).map((row, index) => {
    const value = (key: keyof RosterImportRow) => indexes[key] < 0 ? '' : text(row[indexes[key]])
    const number = Number(value('number'))
    const record: RosterImportRow = { studentCode: value('studentCode'), number, title: value('title'), firstName: value('firstName'), lastName: value('lastName'), nickname: value('nickname'), privateNote: value('privateNote') }
    if (!record.studentCode || !Number.isInteger(number) || number < 1 || !record.firstName || !record.lastName) throw new Error(`แถวที่ ${index + 2}: กรุณาตรวจรหัส เลขที่ ชื่อ และนามสกุล`)
    return record
  })
  if (!result.length) throw new Error('ไม่พบรายชื่อนักเรียนในไฟล์')
  const duplicates = result.map((item) => item.studentCode).filter((code, index, all) => all.indexOf(code) !== index)
  if (duplicates.length) throw new Error(`รหัสนักเรียนซ้ำในไฟล์: ${[...new Set(duplicates)].join(', ')}`)
  return result
}
