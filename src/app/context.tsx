import { createContext, useContext } from 'react'
import type { BootstrapData, DomainMutation, Locale, ThemePreference } from '../domain/types'
import type { SyncSummary } from '../features/sync/engine'
import type { TranslationKey } from '../i18n/dictionaries'

export type AppRoute = 'today' | 'attendance' | 'work' | 'quick-edit' | 'schedule' | 'gradebook' | 'behavior' | 'reports' | 'settings'

export interface AppContextValue {
  data: BootstrapData
  locale: Locale
  theme: ThemePreference
  density: 'comfortable' | 'compact'
  textSize: 'standard' | 'large'
  route: AppRoute
  online: boolean
  demo: boolean
  syncSummary: SyncSummary
  academicYearId: string
  t: (key: TranslationKey) => string
  navigate: (route: AppRoute) => void
  mutate: (mutation: DomainMutation) => Promise<void>
  setLocale: (locale: Locale) => void
  setTheme: (theme: ThemePreference) => void
  setDensity: (density: 'comfortable' | 'compact') => void
  setTextSize: (size: 'standard' | 'large') => void
  setAcademicYearId: (id: string) => void
  syncNow: () => Promise<void>
  lock: () => void
  disconnect: () => void
  requestServerExport: (payload: unknown) => Promise<{ jobId: string; exportRequestId: string }>
  updatePin: (currentPin: string, newPin: string) => Promise<void>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppContext.Provider')
  return context
}
