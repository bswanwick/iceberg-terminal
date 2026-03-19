import { useEffect, useMemo, useState } from 'react'
import styles from './TelegramWire.module.css'

type TelegramWireProps = {
  message: string[]
  fixedLineCount?: number
  deferredLineCount?: number
  charIntervalMs?: number
  className?: string
  headerLabel?: string
  headerColor?: string
  showTimestamp?: boolean
  timestampDate?: Date
}

const DEFAULT_CHAR_INTERVAL_MS = 42

type TelegramWireBodyProps = {
  lines: string[]
  charIntervalMs: number
  onComplete: () => void
}

function isSeparatorLine(line: string) {
  return /^-+$/.test(line)
}

function renderWireLines(lines: string[], isTransmitting: boolean) {
  return lines.map((line, index) => {
    const lineClassName = isSeparatorLine(line)
      ? `${styles.line} ${styles.lineNoWrap}`
      : styles.line

    return (
      <span key={`${index}:${line}`} className={lineClassName}>
        {line.length > 0 ? line : '\u00A0'}
        {isTransmitting && index === lines.length - 1 && <span className={styles.cursor}>_</span>}
      </span>
    )
  })
}

function TelegramWireBody({ lines, charIntervalMs, onComplete }: TelegramWireBodyProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const message = useMemo(() => lines.join('\n'), [lines])

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

  return <>{renderWireLines(visibleLines, isTransmitting)}</>
}

function TelegramWire({
  message,
  fixedLineCount = 0,
  deferredLineCount = 0,
  charIntervalMs = DEFAULT_CHAR_INTERVAL_MS,
  className,
  headerLabel = 'Incoming Wire Transmission',
  headerColor,
  showTimestamp = true,
  timestampDate,
}: TelegramWireProps) {
  const [replaySeed, setReplaySeed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const safeFixedLineCount = Math.min(Math.max(fixedLineCount, 0), message.length)
  const safeDeferredLineCount = Math.min(
    Math.max(deferredLineCount, 0),
    message.length - safeFixedLineCount,
  )
  const animatedLineEnd = message.length - safeDeferredLineCount
  const fixedLines = useMemo(
    () => message.slice(0, safeFixedLineCount),
    [message, safeFixedLineCount],
  )
  const animatedLines = useMemo(
    () => message.slice(safeFixedLineCount, animatedLineEnd),
    [message, safeFixedLineCount, animatedLineEnd],
  )
  const deferredLines = useMemo(() => message.slice(animatedLineEnd), [message, animatedLineEnd])
  const animatedMessageText = useMemo(() => animatedLines.join('\n'), [animatedLines])

  const transmissionKey = useMemo(
    () => `${animatedMessageText.length}:${charIntervalMs}:${animatedMessageText}:${replaySeed}`,
    [animatedMessageText, charIntervalMs, replaySeed],
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
      <div className={styles.message}>
        {fixedLines.length > 0 && renderWireLines(fixedLines, false)}
        <TelegramWireBody
          key={transmissionKey}
          lines={animatedLines}
          charIntervalMs={charIntervalMs}
          onComplete={() => setIsComplete(true)}
        />
        {isComplete && deferredLines.length > 0 && renderWireLines(deferredLines, false)}
      </div>

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
