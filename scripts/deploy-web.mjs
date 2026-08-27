import { execFileSync } from 'node:child_process'
execFileSync('npm',['run','verify'],{stdio:'inherit'})
execFileSync('git',['push','origin','HEAD'],{stdio:'inherit'})
console.log('GitHub Actions will publish the verified build to Pages.')
