import { afterEach, describe, expect, it } from 'vitest'
import { configuredWebAppUrl } from '../src/config/runtime'

afterEach(() => {
  delete window.__KRUNOTE_CONFIG__
})

describe('runtime config', () => {
  it('normalizes a configured Apps Script endpoint', () => {
    window.__KRUNOTE_CONFIG__ = {
      webAppUrl: 'https://script.google.com/macros/s/deployment-id/dev',
    }
    expect(configuredWebAppUrl()).toBe('https://script.google.com/macros/s/deployment-id/exec')
  })

  it('falls back to interactive setup when config is blank or invalid', () => {
    window.__KRUNOTE_CONFIG__ = { webAppUrl: '' }
    expect(configuredWebAppUrl()).toBe('')
    window.__KRUNOTE_CONFIG__ = { webAppUrl: 'https://example.com/not-apps-script' }
    expect(configuredWebAppUrl()).toBe('')
  })
})
