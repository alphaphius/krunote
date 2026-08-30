import { normalizeEndpoint } from '../api/client'

type KruNoteRuntimeConfig = {
  webAppUrl?: string
}

declare global {
  interface Window {
    __KRUNOTE_CONFIG__?: KruNoteRuntimeConfig
  }
}

export function configuredWebAppUrl(): string {
  const value = window.__KRUNOTE_CONFIG__?.webAppUrl?.trim()
  if (!value) return ''
  try {
    return normalizeEndpoint(value)
  } catch {
    return ''
  }
}
