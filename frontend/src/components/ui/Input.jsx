import styles from './Input.module.css'
import clsx from 'clsx'

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  className,
  ...props
}) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={clsx(styles.inputWrap, error && styles.hasError)}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input className={clsx(styles.input, className)} {...props} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {!error && hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
