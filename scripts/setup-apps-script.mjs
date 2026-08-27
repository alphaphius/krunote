import { execFileSync } from 'node:child_process'
execFileSync('clasp',['push','--force'],{stdio:'inherit'})
console.log('Apps Script source uploaded. Deploy it as a Web app that executes as you and allows anyone to access.')
