import { execFileSync } from 'node:child_process'
execFileSync('clasp',['push','--force'],{stdio:'inherit'})
console.log('Apps Script source uploaded to the configured container-bound project. Run setupKruNote from its spreadsheet, then deploy it as a Web app that executes as you and allows anyone to access.')
