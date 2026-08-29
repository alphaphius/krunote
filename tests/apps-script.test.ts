import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const databaseSource = readFileSync(resolve('apps-script/Database.gs'), 'utf8')
const setupSource = readFileSync(resolve('apps-script/ContainerSetup.gs'), 'utf8')
const readme = readFileSync(resolve('README.md'), 'utf8')

describe('Apps Script container-bound database setup', () => {
  it('never creates a separate spreadsheet for the KruNote database', () => {
    expect(databaseSource).not.toContain('SpreadsheetApp.create(')
    expect(databaseSource).toContain('SpreadsheetApp.getActiveSpreadsheet()')
  })

  it('provides an idempotent setup action from the copied spreadsheet', () => {
    expect(setupSource).toContain('function onOpen()')
    expect(setupSource).toContain("addItem('สร้าง/อัปเดตฐานข้อมูล', 'setupKruNote')")
    expect(setupSource).toContain('function setupKruNote()')
    expect(setupSource).toContain('setupSystem_({ includeMock: false })')
  })

  it('documents the official copy-template onboarding path', () => {
    expect(readme).toContain('https://docs.google.com/spreadsheets/d/1uS7TERCyGExk3QTnoZERtAnhi1bdMcdO8hiC5HiKfNQ/copy')
    expect(readme).toContain('KruNote → สร้าง/อัปเดตฐานข้อมูล')
    expect(readme).toContain('Deploy → New deployment → Web app')
  })
})
