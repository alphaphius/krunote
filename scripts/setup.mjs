import { execFileSync } from 'node:child_process'
execFileSync('npm',['install'],{stdio:'inherit'})
execFileSync('npm',['run','verify'],{stdio:'inherit'})
console.log('KruNote is ready. Copy the Google Sheet template, run setupKruNote in its bound Apps Script, then deploy it as a Web app.')
