import styles from './AuthPage.module.css'

export default function AuthInput({ label, error, ...props }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      <input className={styles.fieldInput} {...props} />
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  )
}