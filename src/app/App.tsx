import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiClient, normalizeEndpoint } from '../api/client'
import { AppContext, type AppContextValue, type AppRoute } from './context'
import type { BootstrapData, DomainMutation, Locale, SessionInfo, ThemePreference } from '../domain/types'
import { applyLocalMutation } from '../domain/mutations'
import { createMockData } from '../mock/data'
import { clearProtectedLocalData, createCryptoSession, hasCachedBootstrap, loadBootstrap, outboxSummary, queueMutation, recoverSendingMutations, saveBootstrap } from '../db/database'
import { syncOutbox, type SyncSummary } from '../features/sync/engine'
import { dictionary } from '../i18n/dictionaries'
import { AppShell } from '../components/AppShell'
import { SetupPage, UnlockPage, ChangePinPage } from '../pages/AuthPages'
import { BehaviorPage, GradebookPage, QuickEditPage, ReportsPage, SettingsPage, TodayPage, WorkPage } from '../pages/AppPages'

const emptySummary: SyncSummary = { QUEUED: 0, SENDING: 0, RETRY_WAIT: 0, CONFLICT: 0, FAILED: 0, CONFIRMED: 0 }
type Phase = 'setup' | 'unlock' | 'change-pin' | 'app'

export default function App() {
  const [locale,setLocaleState] = useState<Locale>(() => (localStorage.getItem('krunote.locale') as Locale) || 'th')
  const [theme,setThemeState] = useState<ThemePreference>(() => (localStorage.getItem('krunote.theme') as ThemePreference) || 'system')
  const [density,setDensityState] = useState<'comfortable'|'compact'>(() => localStorage.getItem('krunote.density') === 'compact' ? 'compact' : 'comfortable')
  const [textSize,setTextSizeState] = useState<'standard'|'large'>(() => localStorage.getItem('krunote.textSize') === 'large' ? 'large' : 'standard')
  const [endpoint,setEndpoint] = useState(() => localStorage.getItem('krunote.endpoint') || '')
  const [phase,setPhase] = useState<Phase>(() => localStorage.getItem('krunote.endpoint') ? 'unlock' : 'setup')
  const [data,setData] = useState<BootstrapData | null>(null); const [route,setRoute] = useState<AppRoute>('today'); const [demo,setDemo] = useState(false)
  const [online,setOnline] = useState(navigator.onLine); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [cached,setCached] = useState(false); const [syncSummary,setSyncSummary] = useState<SyncSummary>(emptySummary)
  const [initialPin,setInitialPin] = useState(() => sessionStorage.getItem('krunote.initialPin') || '')
  const keyRef = useRef<CryptoKey | null>(null); const sessionRef = useRef<SessionInfo | null>(null); const api = useMemo(() => endpoint && endpoint !== 'demo' ? new ApiClient(endpoint) : null,[endpoint])

  useEffect(() => { void hasCachedBootstrap().then(setCached); void recoverSendingMutations(); void outboxSummary().then(setSyncSummary) },[])
  useEffect(() => { const up = () => setOnline(true); const down = () => setOnline(false); addEventListener('online',up); addEventListener('offline',down); return () => { removeEventListener('online',up); removeEventListener('offline',down) } },[])
  useEffect(() => {
    document.documentElement.dataset.density = density; document.documentElement.dataset.textSize = textSize
    const apply = () => { const resolved = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme; document.documentElement.dataset.theme = resolved }
    apply(); const media = matchMedia('(prefers-color-scheme: dark)'); media.addEventListener('change',apply); return () => media.removeEventListener('change',apply)
  },[theme,density,textSize])
  const setLocale = (value: Locale) => { localStorage.setItem('krunote.locale',value); setLocaleState(value) }; const setTheme = (value: ThemePreference) => { localStorage.setItem('krunote.theme',value); setThemeState(value) }; const setDensity = (value: 'comfortable'|'compact') => { localStorage.setItem('krunote.density',value); setDensityState(value) }; const setTextSize = (value: 'standard'|'large') => { localStorage.setItem('krunote.textSize',value); setTextSizeState(value) }

  const connect = async (rawUrl: string, includeMock: boolean) => { setBusy(true); setError(''); try { const url = normalizeEndpoint(rawUrl); const client = new ApiClient(url); const health = await client.health(); if (!health.installed) { const setup=await client.setup(includeMock); if(setup.initialPin){sessionStorage.setItem('krunote.initialPin',setup.initialPin);setInitialPin(setup.initialPin)} } await client.connectionTest(); localStorage.setItem('krunote.endpoint',url); setEndpoint(url); setPhase('unlock') } catch (cause) { setError(cause instanceof Error ? cause.message : 'เชื่อมต่อไม่สำเร็จ') } finally { setBusy(false) } }
  const startDemo = () => { const mock = createMockData(); setDemo(true); setData(mock); setEndpoint('demo'); setPhase('app'); setError('') }
  const unlock = useCallback(async (pin: string) => { setBusy(true); setError(''); try { const key = await createCryptoSession(pin); if (!navigator.onLine && cached) { const local = await loadBootstrap(key); if (!local) throw new Error('PIN ไม่ถูกต้องหรือข้อมูลออฟไลน์เสียหาย'); keyRef.current = key; setData(local); setPhase('app'); return }
    if (!api) throw new Error('ยังไม่ได้เชื่อมต่อ Apps Script'); const session = await api.verifyPin(pin); const remote = await api.bootstrap(session.token); keyRef.current = key; sessionRef.current = session; setData(remote); await saveBootstrap(key,remote); setPhase(session.mustChangePin ? 'change-pin' : 'app')
  } catch (cause) { setError(cause instanceof Error ? cause.message : 'ปลดล็อกไม่สำเร็จ') } finally { setBusy(false) } },[api,cached])
  const changePin = async (current: string,next: string) => { if (!api || !sessionRef.current) return; setBusy(true); setError(''); try { const session = await api.changePin(sessionRef.current.token,current,next); const key = await createCryptoSession(next); keyRef.current = key; sessionRef.current = session; sessionStorage.removeItem('krunote.initialPin'); setInitialPin(''); if (data) await saveBootstrap(key,data); setPhase('app') } catch (cause) { setError(cause instanceof Error ? cause.message : 'เปลี่ยน PIN ไม่สำเร็จ') } finally { setBusy(false) } }
  const syncNow = useCallback(async () => { if (demo || !api || !sessionRef.current || !keyRef.current || !navigator.onLine) return; setSyncSummary(await syncOutbox(api,sessionRef.current.token,keyRef.current,setSyncSummary)) },[api,demo])
  useEffect(() => { if (phase !== 'app' || demo) return; const timer = window.setInterval(() => void syncNow(),15000); void syncNow(); return () => clearInterval(timer) },[phase,demo,syncNow])
  const mutate = async (mutation: DomainMutation) => { if (!data) return; const next = applyLocalMutation(data,mutation); setData(next); if (demo) return; if (!keyRef.current) throw new Error('แอปถูกล็อก'); await queueMutation(keyRef.current,mutation); await saveBootstrap(keyRef.current,next); setSyncSummary(await outboxSummary()); if (navigator.onLine) void syncNow() }
  const lock = () => { sessionRef.current = null; keyRef.current = null; setData(null); setPhase(demo ? 'setup' : 'unlock'); setDemo(false) }
  const disconnect = () => { void clearProtectedLocalData(); sessionRef.current = null; keyRef.current = null; localStorage.removeItem('krunote.endpoint'); setEndpoint(''); setData(null); setDemo(false); setPhase('setup'); setCached(false) }
  const requestServerExport = async (payload: unknown) => { if (!api || !sessionRef.current) throw new Error('ต้องออนไลน์และปลดล็อกก่อนสร้างรายงาน'); return api.requestExport(sessionRef.current.token,payload) }

  if (phase === 'setup') return <SetupPage locale={locale} setLocale={setLocale} onConnect={connect} onDemo={startDemo} busy={busy} error={error} />
  if (phase === 'unlock') return <UnlockPage locale={locale} onUnlock={unlock} onBack={() => setPhase('setup')} busy={busy} error={error} hasOffline={cached} initialPin={initialPin} />
  if (phase === 'change-pin') return <ChangePinPage locale={locale} onChangePin={changePin} busy={busy} error={error} />
  if (!data) return null
  const context: AppContextValue = { data,locale,theme,density,textSize,route,online,demo,syncSummary,t: (key) => dictionary(locale)[key],navigate:setRoute,mutate,setLocale,setTheme,setDensity,setTextSize,syncNow,lock,disconnect,requestServerExport }
  const pages: Record<AppRoute,React.ReactNode> = { today:<TodayPage />, 'quick-edit':<QuickEditPage />, work:<WorkPage />, gradebook:<GradebookPage />, behavior:<BehaviorPage />, reports:<ReportsPage />, settings:<SettingsPage /> }
  return <AppContext.Provider value={context}><AppShell>{pages[route]}</AppShell></AppContext.Provider>
}
