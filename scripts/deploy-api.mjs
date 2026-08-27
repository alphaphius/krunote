import { execFileSync } from 'node:child_process'
execFileSync('clasp',['push','--force'],{stdio:'inherit'})
execFileSync('clasp',['deploy','--description',`KruNote ${new Date().toISOString()}`],{stdio:'inherit'})
