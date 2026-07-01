import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PiggyBank, ArrowLeftRight,
  Users, User, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './AppLayout.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/savings', label: 'Tabungan Pribadi', icon: PiggyBank },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/shared', label: 'Tabungan Bersama', icon: Users },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar')
    navigate('/login')
  }

  const name = user?.user_metadata?.name || user?.email?.split(' @')[0] || 'User'
  const email = user?.email || ''

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <PiggyBank size={22} className={styles.brandIcon} />
          <span>Tabunganku</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
            <div className={styles.userText}>
              <p className={styles.userName}>{name}</p>
              <p className={styles.userEmail}>{email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={styles.topbarRight}>
            <div className={styles.avatarSm}>{name.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
