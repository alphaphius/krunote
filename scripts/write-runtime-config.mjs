import { writeFile } from 'node:fs/promises'

const rawUrl = process.env.KRUNOTE_WEB_APP_URL?.trim()

if (!rawUrl) {
  console.log('KRUNOTE_WEB_APP_URL is not set; keeping the blank runtime config fallback.')
  process.exit(0)
}

const url = new URL(rawUrl)
const match = url.pathname.match(/\/macros\/s\/([^/]+)\/(exec|dev)/)
if (url.protocol !== 'https:' || !url.hostname.endsWith('script.google.com') || !match) {
  throw new Error('KRUNOTE_WEB_APP_URL must be a Google Apps Script HTTPS Web App URL ending in /exec.')
}

const normalized = `${url.origin}/macros/s/${match[1]}/exec`
const config = `window.__KRUNOTE_CONFIG__ = Object.freeze(${JSON.stringify({ webAppUrl: normalized }, null, 2)})\n`
await writeFile('public/config.js', config, 'utf8')
console.log('Generated public/config.js from KRUNOTE_WEB_APP_URL.')
