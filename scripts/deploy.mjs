import { execFileSync } from 'node:child_process'
execFileSync('npm',['run','deploy:api'],{stdio:'inherit'})
execFileSync('npm',['run','deploy:web'],{stdio:'inherit'})
