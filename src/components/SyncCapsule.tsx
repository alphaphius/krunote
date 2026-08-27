import { ArrowsClockwise, CheckCircle, CloudSlash, WarningCircle } from '@phosphor-icons/react'
import { useApp } from '../app/context'

export function SyncCapsule() {
  const { online, syncSummary, t } = useApp()
  const pending = syncSummary.QUEUED + syncSummary.SENDING + syncSummary.RETRY_WAIT
  const problems = syncSummary.CONFLICT + syncSummary.FAILED
  let icon = <CheckCircle weight="fill" />
  let text = t('saved')
  if (!online) { icon = <CloudSlash />; text = `${t('offline')} · ${pending} ${t('queuedChanges')}` }
  else if (problems) { icon = <WarningCircle />; text = `${problems} ${t('conflicts')}` }
  else if (pending) { icon = <ArrowsClockwise />; text = `${pending} ${t('queuedChanges')}` }
  return <div className="sync-capsule" role="status" aria-live="polite">{icon}<span>{text}</span></div>
}
