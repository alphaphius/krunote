import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const checks = { dependencies:existsSync('node_modules'), productionBuild:existsSync('dist/index.html'), appsScriptConfig:existsSync('.clasp.json'), gitRepository:existsSync('.git') }
console.table(checks)
if (checks.appsScriptConfig) { try { console.log(execFileSync('clasp',['status'],{encoding:'utf8'})) } catch { console.log('Apps Script status unavailable') } }
