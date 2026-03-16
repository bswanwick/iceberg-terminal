import { Fragment, useEffect, useMemo, useState } from 'react'
import styles from './TelegramWire.module.css'

type TelegramWireProps = {
  message: string[]
  charIntervalMs?: number
  className?: string
  headerLabel?: string
  headerColor?: string
  showTimestamp?: boolean
  timestampDate?: Date
}

const DEFAULT_CHAR_INTERVAL_MS = 42

type TelegramWireBodyProps = {
  message: string
  charIntervalMs: number
  onComplete: () => void
}

function TelegramWireBody({ message, charIntervalMs, onComplete }: TelegramWireBodyProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= message.length) {
      return undefined
    }

    const timerId = window.setTimeout(
      () => {
        setVisibleCount((current) => current + 1)
      },
      Math.max(1, charIntervalMs),
    )

    return () => {
      window.clearTimeout(timerId)
    }
  }, [visibleCount, message, charIntervalMs])

  useEffect(() => {
    if (visibleCount >= message.length) {
      onComplete()
    }
  }, [visibleCount, message.length, onComplete])

  const visibleText = useMemo(() => message.slice(0, visibleCount), [message, visibleCount])
  const visibleLines = useMemo(() => visibleText.split('\n'), [visibleText])
  const isTransmitting = visibleCount < message.length

  return (
    <p className={styles.message}>
      {visibleLines.map((line, index) => (
        <Fragment key={`${index}:${line}`}>
          {line}
          {index < visibleLines.length - 1 && <br />}
        </Fragment>
      ))}
      {isTransmitting && <span className={styles.cursor}>_</span>}
    </p>
  )
}

function TelegramWire({
  message,
  charIntervalMs = DEFAULT_CHAR_INTERVAL_MS,
  className,
  headerLabel = 'Incoming Wire Transmission',
  headerColor,
  showTimestamp = true,
  timestampDate,
}: TelegramWireProps) {
  const [replaySeed, setReplaySeed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const messageText = useMemo(() => message.join('\n'), [message])

  const transmissionKey = useMemo(
    () => `${messageText.length}:${charIntervalMs}:${messageText}:${replaySeed}`,
    [messageText, charIntervalMs, replaySeed],
  )
  const containerClassName = className ? `${styles.container} ${className}` : styles.container
  const receivedAt = useMemo(() => {
    const sourceDate = timestampDate ?? new Date()
    return sourceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }, [timestampDate])

  const handleReplay = () => {
    setIsComplete(false)
    setReplaySeed((current) => current + 1)
  }

  return (
    <section className={containerClassName} aria-live="polite" aria-atomic="true">
      <div
        className={styles.header}
        style={{ color: headerColor, fontWeight: 'bold', fontSize: '1.2em' }}
      >
        {headerLabel}
      </div>
      {showTimestamp && <div className={styles.timestamp}>Received at {receivedAt}</div>}
      <TelegramWireBody
        key={transmissionKey}
        message={messageText}
        charIntervalMs={charIntervalMs}
        onComplete={() => setIsComplete(true)}
      />

      {isComplete && (
        <button
          type="button"
          onClick={handleReplay}
          className={styles.replayButton}
          aria-label="Replay telegram transmission"
          title="Replay"
        >
          ↺
        </button>
      )}
    </section>
  )
}

export default TelegramWire
