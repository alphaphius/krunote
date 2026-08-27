import { useEffect, useState, type FormEvent } from 'react'
import type { Locale } from '../domain/types'
import { dictionary } from '../i18n/dictionaries'
import { Brand } from '../components/Brand'
import { Button, Field, Input } from '../components/ui'
import { PinPad } from '../components/PinPad'

function LanguageSwitch({ locale, onChange }: { locale: Locale; onChange: (value: Locale) => void }) {
  return <div className="button-row auth-language"><Button type="button" variant={locale === 'th' ? 'secondary' : 'ghost'} onClick={() => onChange('th')}>ไทย</Button><Button type="button" variant={locale === 'en' ? 'secondary' : 'ghost'} onClick={() => onChange('en')}>English</Button></div>
}

export function SetupPage({ locale, setLocale, onConnect, onDemo, busy, error }: { locale: Locale; setLocale: (value: Locale) => void; onConnect: (url: string, includeMock: boolean) => Promise<void>; onDemo: () => void; busy: boolean; error?: string }) {
  const t = dictionary(locale)
  const [url, setUrl] = useState('')
  const [includeMock, setIncludeMock] = useState(true)
  const submit = (event: FormEvent) => { event.preventDefault(); void onConnect(url, includeMock) }
  return <main className="auth-shell"><section className="auth-panel"><div className="auth-top"><Brand title={t.appName} subtitle={t.tagline} /><LanguageSwitch locale={locale} onChange={setLocale} /></div><h1>{t.setupTitle}</h1><p className="muted">{t.setupBody}</p><form className="stack" onSubmit={submit}><Field label={t.webAppUrl} helper={t.setupHint} error={error}><Input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://script.google.com/macros/s/…/exec" required aria-invalid={Boolean(error)} /></Field><label className="checkbox-row"><input type="checkbox" checked={includeMock} onChange={(event) => setIncludeMock(event.target.checked)} />{t.includeMock}</label><Button type="submit" disabled={busy}>{busy ? t.connecting : t.connect}</Button><Button type="button" variant="secondary" onClick={onDemo} disabled={busy}>{t.demoMode}</Button></form></section></main>
}

export function UnlockPage({ locale, onUnlock, onBack, busy, error, hasOffline }: { locale: Locale; onUnlock: (pin: string) => Promise<void>; onBack: () => void; busy: boolean; error?: string; hasOffline: boolean }) {
  const t = dictionary(locale)
  const [pin, setPin] = useState('')
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (/^\d$/.test(event.key) && pin.length < 12) setPin((value) => value + event.key); if (event.key === 'Backspace') setPin((value) => value.slice(0, -1)); if (event.key === 'Enter' && pin.length >= 4) void onUnlock(pin) }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [pin, onUnlock])
  return <main className="auth-shell"><section className="auth-panel"><Brand title={t.appName} subtitle={t.tagline} /><h1>{t.unlockTitle}</h1><p className="muted">{hasOffline ? t.offlineUnlock : t.initialPinHint}</p><PinPad value={pin} onChange={setPin} maxLength={12} />{error && <p className="error-copy" role="alert">{error}</p>}<div className="stack auth-actions"><Button onClick={() => void onUnlock(pin)} disabled={busy || pin.length < 4}>{busy ? t.unlocking : t.unlock}</Button><Button variant="ghost" onClick={onBack}>{t.cancel}</Button></div></section></main>
}

export function ChangePinPage({ locale, onChangePin, busy, error }: { locale: Locale; onChangePin: (current: string, next: string) => Promise<void>; busy: boolean; error?: string }) {
  const t = dictionary(locale); const [current, setCurrent] = useState(''); const [next, setNext] = useState(''); const [confirm, setConfirm] = useState('')
  const localError = next && (next.length < 6 || next.length > 12 || !/^\d+$/.test(next)) ? 'PIN ต้องเป็นตัวเลข 6–12 หลัก' : confirm && next !== confirm ? 'PIN ใหม่ไม่ตรงกัน' : ''
  return <main className="auth-shell"><section className="auth-panel"><Brand title={t.appName} subtitle={t.tagline} /><h1>{t.changePinTitle}</h1><form className="stack" onSubmit={(event) => { event.preventDefault(); void onChangePin(current, next) }}><Field label={t.currentPin}><Input type="password" inputMode="numeric" value={current} onChange={(event) => setCurrent(event.target.value.replace(/\D/g, '').slice(0, 12))} required /></Field><Field label={t.newPin}><Input type="password" inputMode="numeric" value={next} onChange={(event) => setNext(event.target.value.replace(/\D/g, '').slice(0, 12))} required /></Field><Field label={t.confirmPin} error={localError || error}><Input type="password" inputMode="numeric" value={confirm} onChange={(event) => setConfirm(event.target.value.replace(/\D/g, '').slice(0, 12))} required /></Field><Button type="submit" disabled={busy || Boolean(localError) || next.length < 6}>{t.changePin}</Button></form></section></main>
}
