const [endpoint, ...flags] = process.argv.slice(2)

if (!endpoint) {
  console.error('Usage: npm run initialize:api -- "https://script.google.com/macros/s/DEPLOYMENT_ID/exec" [--mock]')
  process.exit(1)
}

let url
try {
  url = new URL(endpoint)
  if (url.protocol !== 'https:' || !url.hostname.endsWith('script.google.com') || !url.pathname.endsWith('/exec')) throw new Error()
} catch {
  console.error('Invalid Apps Script Web App URL. It must use HTTPS and end with /exec.')
  process.exit(1)
}

const response = await fetch(url, {
  method: 'POST',
  redirect: 'follow',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({
    action: 'setup',
    payload: { includeMock: flags.includes('--mock') },
    clientVersion: '1.0.0',
    requestId: crypto.randomUUID(),
  }),
})

const envelope = await response.json()
if (!envelope.ok) {
  console.error(`${envelope.error?.code ?? 'SETUP_FAILED'}: ${envelope.error?.message ?? 'Apps Script setup failed'}`)
  process.exit(1)
}

console.log('KruNote API installed successfully.')
console.log(`Mock data: ${flags.includes('--mock') ? 'enabled' : 'disabled'}`)
if (envelope.data?.initialPin) {
  console.log(`One-time initial PIN: ${envelope.data.initialPin}`)
  console.log('Save it now. KruNote will require you to replace it after first unlock.')
} else {
  console.log('This API was already installed; its existing PIN was preserved.')
}
