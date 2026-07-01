import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../api/profile'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/helpers'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, updateUserLocal } = useAuth()
  const meta = user?.user_metadata || {}

  const [profileForm, setProfileForm] = useState({
    name: meta.name || '',
    username: meta.username || '',
    avatar: meta.avatar || '',
  })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    const payload = {}
    if (profileForm.name.trim()) payload.name = profileForm.name.trim()
    if (profileForm.username.trim()) payload.username = profileForm.username.trim()
    if (profileForm.avatar.trim()) payload.avatar = profileForm.avatar.trim()
    if (Object.keys(payload).length === 0) {
      toast.error('Isi setidaknya satu field')
      return
    }
    setLoadingProfile(true)
    try {
      const { data } = await profileApi.update(payload)
      updateUserLocal(data.data.user)
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoadingProfile(false)
    }
  }

  const validatePw = () => {
    const e = {}
    if (!pwForm.old_password) e.old_password = 'Password lama wajib diisi'
    if (!pwForm.new_password) e.new_password = 'Password baru wajib diisi'
    else if (pwForm.new_password.length < 8) e.new_password = 'Minimal 8 karakter'
    if (pwForm.new_password !== pwForm.confirm) e.confirm = 'Password tidak cocok'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePwSave = async (e) => {
    e.preventDefault()
    if (!validatePw()) return
    setLoadingPw(true)
    try {
      await profileApi.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Password berhasil diubah. Silakan login kembali.')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoadingPw(false)
    }
  }

  const name = meta.name || user?.email?.split(' @')[0] || 'User'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profil</h1>

      <div className={styles.grid}>
        {/* Profile info */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><User size={18} /></div>
            <h2 className={styles.cardTitle}>Informasi Akun</h2>
          </div>

          <div className={styles.avatarRow}>
            <div className={styles.bigAvatar}>{name.charAt(0).toUpperCase()}</div>
            <div>
              <p className={styles.bigName}>{name}</p>
              <p className={styles.bigEmail}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className={styles.form}>
            <Input label="Nama" placeholder="Nama lengkap" value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            <Input label="Username" placeholder="username" value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} />
            <Input label="URL Avatar" placeholder="https://..." value={profileForm.avatar}
              onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })} />
            <Button type="submit" loading={loadingProfile}>Simpan Perubahan</Button>
          </form>
        </div>

        {/* Change password */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
              <Lock size={18} />
            </div>
            <h2 className={styles.cardTitle}>Ubah Password</h2>
          </div>

          <form onSubmit={handlePwSave} className={styles.form}>
            <Input label="Password Lama" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={pwForm.old_password}
              onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
              error={pwErrors.old_password} />
            <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter"
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              error={pwErrors.new_password} />
            <Input label="Konfirmasi Password Baru" type="password" placeholder="Ulangi password baru"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              error={pwErrors.confirm} />
            <Button type="submit" variant="secondary" loading={loadingPw}>Ubah Password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
