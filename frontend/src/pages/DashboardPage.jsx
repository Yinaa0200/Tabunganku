import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, PiggyBank, Target, Users, ArrowRight } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import { formatRupiah, formatDateTime, getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import styles from './DashboardPage.module.css'

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color + '18', color }}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
  console.log('Token:', localStorage.getItem('token'))
      try {
        const [dashRes, actRes] = await Promise.all([
          dashboardApi.get(),
          dashboardApi.getActivity({ limit: 5 }),
        ])
        setData(dashRes.data.data.dashboard)
        setActivity(actRes.data.data?.recent_transactions || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className={styles.loading}>Memuat dashboard...</div>

  const d = data || {}

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Ringkasan keuangan Anda</p>
      </div>

      <div className={styles.stats}>
        <StatCard
          label="Total Saldo"
          value={formatRupiah(d.total_savings)}
          icon={PiggyBank}
          color="var(--color-primary)"
          sub={`dari ${formatRupiah(d.num_savings_goals)} target`}
        />
        <StatCard
          label="Total Setoran"
          value={formatRupiah(d.total_deposit)}
          icon={TrendingUp}
          color="var(--color-success)"
        />
        <StatCard
          label="Total Penarikan"
          value={formatRupiah(d.total_withdrawal)}
          icon={TrendingDown}
          color="var(--color-danger)"
        />
        <StatCard
          label="Target Tabungan"
          value={d.total_savings ?? 0}
          icon={Target}
          color="var(--color-warning)"
          sub="tabungan aktif"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Aktivitas Terbaru</h2>
          <Link to="/transactions" className={styles.seeAll}>
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        {activity.length === 0 ? (
          <div className={styles.empty}>Belum ada aktivitas transaksi.</div>
        ) : (
          <div className={styles.activityList}>
            {activity.map((tx) => (
              <div key={tx.id} className={styles.activityItem}>
                <div
                  className={styles.txIcon}
                  style={{
                    background: tx.type === 'deposit'
                      ? 'var(--color-success-light)'
                      : 'var(--color-danger-light)',
                    color: tx.type === 'deposit'
                      ? 'var(--color-success)'
                      : 'var(--color-danger)',
                  }}
                >
                  {tx.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className={styles.txInfo}>
                  <p className={styles.txDesc}>{tx.description || (tx.type === 'deposit' ? 'Setoran' : 'Penarikan')}</p>
                  <p className={styles.txDate}>{formatDateTime(tx.created_at)}</p>
                </div>
                <p
                  className={styles.txAmount}
                  style={{ color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
