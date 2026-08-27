import { execFileSync } from 'node:child_process'
execFileSync('npm',['install'],{stdio:'inherit'})
execFileSync('npm',['run','verify'],{stdio:'inherit'})
console.log('KruNote is ready. Add .clasp.json, then run npm run setup:apps-script.')
