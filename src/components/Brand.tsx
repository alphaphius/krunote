import { BookOpenText } from '@phosphor-icons/react'

export function Brand({ withSubtitle = true, title = 'KruNote', subtitle = 'ผู้ช่วยครูส่วนตัว' }: { withSubtitle?: boolean; title?: string; subtitle?: string }) {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true"><BookOpenText weight="bold" /></span>
      <div>
        <p className="brand-title">{title}</p>
        {withSubtitle && <span className="brand-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}
