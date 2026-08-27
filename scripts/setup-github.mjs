import { execFileSync } from 'node:child_process'
execFileSync('gh',['repo','create','krunote','--private','--source=.','--remote=origin','--push'],{stdio:'inherit'})
console.log('Repository created. Change visibility to public if GitHub Pages on your plan requires it.')
