import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthInput from './AuthInput'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Nama wajib diisi'
    if (!form.email) e.email = 'Email wajib diisi'
    if (!form.password) e.password = 'Password wajib diisi'
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Password tidak cocok'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Registrasi berhasil! Cek email untuk verifikasi.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Sisi kiri: ilustrasi + kutipan */}
      <div className={styles.visualSide}>
        <svg className={styles.scallopFoam} viewBox="0 0 80 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 Q40,25 0,50 Q40,75 0,100 Q40,125 0,150 Q40,175 0,200
                   Q40,225 0,250 Q40,275 0,300 Q40,325 0,350 Q40,375 0,400
                   Q40,425 0,450 Q40,475 0,500 L80,500 L80,0 Z" fill="#FFFFFF"/>
        </svg>
        <svg className={styles.scallop} viewBox="0 0 80 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 Q40,25 0,50 Q40,75 0,100 Q40,125 0,150 Q40,175 0,200
                   Q40,225 0,250 Q40,275 0,300 Q40,325 0,350 Q40,375 0,400
                   Q40,425 0,450 Q40,475 0,500 L80,500 L80,0 Z" fill="#FFEED9"/>
        </svg>
        <div className={styles.brand}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C12 4 9 7 9 11c0 2.5 1.3 4.6 3.2 5.8C10.8 18 10 19.8 10 21.8 10 25.8 12.7 29 16 29s6-3.2 6-7.2c0-2-.8-3.8-2.2-5C21.7 15.6 23 13.5 23 11c0-4-3-7-7-7Z" fill="currentColor"/>
            <rect x="14.5" y="21" width="3" height="7" fill="currentColor"/>
          </svg>
          <span>Tabunganku</span>
        </div>

        <div className={styles.quoteBlock}>
          <p className={styles.quote}>
            “Jika kamu tahu cara membelanjakan uang dengan benar, kamu pasti
            tahu cara menabung. Keduanya adalah seni yang saling melengkapi.”
          </p>
          <p className={styles.quoteAuthor}>— Ayn Rand, Filsuf dan Penulis</p>
        </div>
      </div>

      {/* Sisi kanan: form daftar */}
      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          <h1 className={styles.title}>Buat akun baru</h1>
          <p className={styles.subtitle}>Mulai perjalanan menabung Anda.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <AuthInput
              label="Nama"
              type="text"
              placeholder="Nama lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <AuthInput
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <AuthInput
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="new-password"
            />
            <AuthInput
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className={styles.footer}>
            Sudah punya akun?{' '}
            <Link to="/login" className={styles.link}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}