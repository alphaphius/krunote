import { Backspace } from '@phosphor-icons/react'

export function PinPad({ value, onChange, maxLength = 12 }: { value: string; onChange: (value: string) => void; maxLength?: number }) {
  const press = (digit: string) => { if (value.length < maxLength) onChange(value + digit) }
  return (
    <>
      <div className="pin-dots" aria-label={`PIN ${value.length} หลัก`}>
        {Array.from({ length: Math.max(6, value.length) }, (_, index) => <span key={index} className={`pin-dot ${index < value.length ? 'filled' : ''}`} />)}
      </div>
      <div className="pin-grid" aria-label="แป้นตัวเลข">
        {[1,2,3,4,5,6,7,8,9].map((digit) => <button className="pin-key" type="button" key={digit} onClick={() => press(String(digit))}>{digit}</button>)}
        <span aria-hidden="true" />
        <button className="pin-key" type="button" onClick={() => press('0')}>0</button>
        <button className="pin-key" type="button" onClick={() => onChange(value.slice(0, -1))} aria-label="ลบตัวเลข"><Backspace /></button>
      </div>
    </>
  )
}
