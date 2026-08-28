import type { ReactNode } from 'react'
import {
  CalendarDots,
  CalendarCheck,
  ChartBar,
  ClipboardText,
  Gear,
  IdentificationCard,
  Notebook,
  Table,
} from '@phosphor-icons/react'
import { useApp, type AppRoute } from '../app/context'
import { Brand } from './Brand'
import { SyncCapsule } from './SyncCapsule'
import { Button } from './ui'

const allItems: Array<{ route: AppRoute; key: 'today' | 'checkIn' | 'quickEdit' | 'work' | 'schedule' | 'gradebook' | 'behavior' | 'reports' | 'settings'; icon: typeof CalendarDots }> = [
  { route: 'today', key: 'today', icon: CalendarDots },
  { route: 'attendance', key: 'checkIn', icon: CalendarCheck },
  { route: 'work', key: 'work', icon: ClipboardText },
  { route: 'quick-edit', key: 'quickEdit', icon: Table },
  { route: 'schedule', key: 'schedule', icon: CalendarDots },
  { route: 'gradebook', key: 'gradebook', icon: Notebook },
  { route: 'behavior', key: 'behavior', icon: IdentificationCard },
  { route: 'reports', key: 'reports', icon: ChartBar },
  { route: 'settings', key: 'settings', icon: Gear },
]

const mobileItems = [allItems[0], allItems[1], allItems[2], allItems[5]]

function NavButton({ route, label, icon: Icon, active, onClick }: { route: AppRoute; label: string; icon: typeof CalendarDots; active: boolean; onClick: (route: AppRoute) => void }) {
  return <button type="button" className={`nav-link ${active ? 'active' : ''}`} onClick={() => onClick(route)} aria-current={active ? 'page' : undefined}><Icon /><span>{label}</span></button>
}

export function AppShell({ children }: { children: ReactNode }) {
  const { route, navigate, t, online, demo } = useApp()
  return (
    <div className="app-root">
      <header className="app-header">
        <Brand title={t('appName')} subtitle={t('tagline')} />
        <div className="button-row">
          <span className={`status-badge ${online ? 'success' : 'warning'}`}>{demo ? t('demo') : online ? t('online') : t('offline')}</span>
          <Button variant="ghost" onClick={() => navigate('settings')} aria-label={t('settings')}><Gear /></Button>
        </div>
      </header>
      <div className="app-layout">
        <nav className="side-nav" aria-label="เมนูหลัก">
          {allItems.map((item) => <NavButton key={item.route} route={item.route} label={t(item.key)} icon={item.icon} active={route === item.route} onClick={navigate} />)}
        </nav>
        <main className="main" id="main-content">{children}</main>
      </div>
      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {mobileItems.map((item) => <NavButton key={item.route} route={item.route} label={t(item.key)} icon={item.icon} active={route === item.route} onClick={navigate} />)}
        <NavButton route="schedule" label={t('schedule')} icon={CalendarDots} active={route === 'schedule'} onClick={navigate} />
      </nav>
      <SyncCapsule />
    </div>
  )
}
