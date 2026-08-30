import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const required = ['dist/index.html','dist/config.js','dist/manifest.webmanifest','dist/sw.js','dist/icon-192.png','dist/icon-512.png']
await Promise.all(required.map((file) => access(file,constants.R_OK)))
const html = await readFile('dist/index.html','utf8')
if (!html.includes('manifest.webmanifest') || !html.includes('config.js') || !html.includes('KruNote')) throw new Error('Build is missing PWA metadata or runtime config')
const runtimeConfig = await readFile('dist/config.js','utf8')
if (!runtimeConfig.includes('__KRUNOTE_CONFIG__')) throw new Error('Runtime config is malformed')
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest','utf8'))
if (manifest.display !== 'standalone' || manifest.icons.length < 2) throw new Error('Manifest is incomplete')
console.log(`Verified ${required.length} release files and PWA metadata.`)
