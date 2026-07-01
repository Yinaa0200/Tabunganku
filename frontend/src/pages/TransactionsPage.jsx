import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Search, ArrowLeftRight } from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { formatRupiah, formatDateTime, getErrorMessage } from '../utils/helpers'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './TransactionsPage.module.css'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await transactionsApi.list({
        page,
        limit: 15,
        search: search || undefined,
        type: typeFilter || undefined,
      })
      setTransactions(data.data.transactions)
      setPagination(data.data.pagination)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchTransactions(1), 300)
    return () => clearTimeout(t)
  }, [search, typeFilter])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transaksi</h1>
          <p className={styles.subtitle}>{pagination.total} transaksi</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="Cari deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={15} />}
        />
        <div className={styles.filters}>
          {['', 'deposit', 'withdrawal'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${typeFilter === f ? styles.filterActive : ''}`}
              onClick={() => setTypeFilter(f)}
            >
              {f === '' ? 'Semua' : f === 'deposit' ? 'Setoran' : 'Penarikan'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Memuat...</div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Belum ada transaksi" description="Transaksi akan muncul di sini setelah Anda mencatat setoran atau penarikan." />
        ) : (
          <div className={styles.list}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.item}>
                <div className={styles.icon} style={{
                  background: tx.type === 'deposit' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {tx.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className={styles.info}>
                  <p className={styles.desc}>{tx.description || (tx.type === 'deposit' ? 'Setoran' : 'Penarikan')}</p>
                  <p className={styles.date}>{formatDateTime(tx.created_at)}</p>
                </div>
                <div className={styles.right}>
                  <p className={styles.amount} style={{
                    color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                  <span className={styles.badge} style={{
                    background: tx.type === 'deposit' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                    color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {tx.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}>Sebelumnya</Button>
            <span className={styles.pageInfo}>{pagination.page} / {pagination.totalPages}</span>
            <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransactions(pagination.page + 1)}>Selanjutnya</Button>
          </div>
        )}
      </div>
    </div>
  )
}
