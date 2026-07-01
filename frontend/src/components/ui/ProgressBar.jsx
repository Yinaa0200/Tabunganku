import styles from './ProgressBar.module.css'

export default function ProgressBar({ value = 0, showLabel = true, size = 'md' }) {
  const pct = Math.min(Math.max(value, 0), 100)
  const color = pct >= 100 ? 'var(--color-success)' : pct >= 60 ? 'var(--color-primary)' : pct >= 30 ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && <span className={styles.label}>{pct}%</span>}
    </div>
  )
}
