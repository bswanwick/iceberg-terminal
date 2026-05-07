import { useMemo } from 'react'
import styles from './TelegramWire.module.css'

type TelegramWireProps = {
  message: string
  to?: string
  from?: string
  className?: string
  headerLabel?: string
  headerColor?: string
  showTimestamp?: boolean
  timestampDate?: Date
}

const DEFAULT_TICKER_CHARS_PER_MINUTE = 625
const TICKER_CHARACTER_PADDING = 24

function TelegramWire({
  message,
  to: toLabel,
  from: fromLabel,
  className,
  headerLabel = 'Incoming Wire Transmission',
  headerColor,
  showTimestamp = true,
  timestampDate,
}: TelegramWireProps) {
  const hasMetadata = Boolean(toLabel || fromLabel)
  const tickerText = useMemo(() => message.trim(), [message])
  const tickerDurationMs = useMemo(() => {
    const pacedCharacterCount = tickerText.length + TICKER_CHARACTER_PADDING
    const durationMs = (pacedCharacterCount / DEFAULT_TICKER_CHARS_PER_MINUTE) * 60_000

    return durationMs
  }, [tickerText])
  const containerClassName = className ? `${styles.container} ${className}` : styles.container
  const receivedAt = useMemo(() => {
    const sourceDate = timestampDate ?? new Date()
    return sourceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }, [timestampDate])

  return (
    <section className={containerClassName} aria-live="polite" aria-atomic="true">
      <div
        className={styles.header}
        style={{ color: headerColor, fontWeight: 'bold', fontSize: '1.2em' }}
      >
        {headerLabel}
      </div>
      {showTimestamp && <div className={styles.timestamp}>Received at {receivedAt}</div>}
      <div className={styles.message}>
        {hasMetadata && (
          <>
            <span className={`${styles.line} ${styles.lineNoWrap}`}>
              ------------------------------
            </span>
            {toLabel && <span className={styles.line}>{`TO: ${toLabel}`}</span>}
            {fromLabel && <span className={styles.line}>{`FROM: ${fromLabel}`}</span>}
            <span className={`${styles.line} ${styles.lineNoWrap}`}>
              ------------------------------
            </span>
          </>
        )}
        {tickerText && (
          <div className={styles.tickerViewport}>
            <span
              className={styles.tickerTrack}
              style={{ animationDuration: `${tickerDurationMs}ms` }}
            >
              {tickerText}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export default TelegramWire
