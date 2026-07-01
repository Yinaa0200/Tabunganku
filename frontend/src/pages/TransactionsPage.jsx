import { useEffect, useState, useCallback, useMemo } from 'react'
import { TrendingUp, TrendingDown, Search, ArrowLeftRight, Edit2, Trash2, PiggyBank, CalendarRange } from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { savingsApi } from '../api/savings'
import { formatRupiah, formatDateTime, getErrorMessage } from '../utils/helpers'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './TransactionsPage.module.css'

function TransactionForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    type: initial?.type || 'deposit',
    amount: initial?.amount || '',
    description: initial?.description || '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Jumlah harus lebih dari 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ type: form.type, amount: Number(form.amount), description: form.description })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.typeToggle}>
        {['deposit', 'withdrawal'].map((t) => (
          <button key={t} type="button"
            className={`${styles.typeBtn} ${form.type === t ? styles[t] : ''}`}
            onClick={() => setForm({ ...form, type: t })}>
            {t === 'deposit' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {t === 'deposit' ? 'Setoran' : 'Penarikan'}
          </button>
        ))}
      </div>
      <Input label="Jumlah" type="number" placeholder="500000"
        value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
        error={errors.amount} prefix="Rp" />
      <Input label="Keterangan (opsional)" placeholder="Contoh: Gaji bulan Juni"
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button type="submit" fullWidth loading={loading}
        variant={form.type === 'deposit' ? 'success' : 'danger'}>Simpan</Button>
    </form>
  )
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [savingsMap, setSavingsMap] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
  }, [fetchTransactions])

  // Load savings once to resolve each transaction's savings name.
  useEffect(() => {
    const loadSavings = async () => {
      try {
        const { data } = await savingsApi.list({ limit: 100 })
        const map = {}
        for (const s of data.data.savings) map[s.id] = s.name
        setSavingsMap(map)
      } catch (err) {
        // Non-critical: transaction list still works without names.
        console.log('[v0] Gagal memuat nama tabungan:', getErrorMessage(err))
      }
    }
    loadSavings()
  }, [])

  // Client-side date filtering applied to the current page of transactions.
  const visibleTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const created = new Date(tx.created_at)
      if (startDate && created < new Date(`${startDate}T00:00:00`)) return false
      if (endDate && created > new Date(`${endDate}T23:59:59`)) return false
      return true
    })
  }, [transactions, startDate, endDate])

  const handleEdit = async (form) => {
    setSubmitting(true)
    try {
      await transactionsApi.update(modalEdit.id, form)
      toast.success('Transaksi berhasil diperbarui!')
      setModalEdit(null)
      fetchTransactions(pagination.page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await transactionsApi.delete(modalDelete.id)
      toast.success('Transaksi berhasil dihapus!')
      setModalDelete(null)
      fetchTransactions(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const clearDates = () => { setStartDate(''); setEndDate('') }

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

      <div className={styles.dateBar}>
        <CalendarRange size={15} className={styles.dateIcon} />
        <label className={styles.dateField}>
          <span>Dari</span>
          <input type="date" value={startDate} max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)} className={styles.dateInput} />
        </label>
        <label className={styles.dateField}>
          <span>Sampai</span>
          <input type="date" value={endDate} min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)} className={styles.dateInput} />
        </label>
        {(startDate || endDate) && (
          <button className={styles.clearDate} onClick={clearDates}>Reset tanggal</button>
        )}
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Memuat...</div>
        ) : visibleTransactions.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Belum ada transaksi"
            description={(startDate || endDate)
              ? 'Tidak ada transaksi pada rentang tanggal ini.'
              : 'Transaksi akan muncul di sini setelah Anda mencatat setoran atau penarikan.'} />
        ) : (
          <div className={styles.list}>
            {visibleTransactions.map((tx) => (
              <div key={tx.id} className={styles.item}>
                <div className={styles.icon} style={{
                  background: tx.type === 'deposit' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {tx.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className={styles.info}>
                  <p className={styles.desc}>{tx.description || (tx.type === 'deposit' ? 'Setoran' : 'Penarikan')}</p>
                  <p className={styles.savingsName}>
                    <PiggyBank size={11} /> {savingsMap[tx.savings_id] || 'Tabungan'}
                  </p>
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
                <div className={styles.actions}>
                  <button className={styles.actBtn} onClick={() => setModalEdit(tx)} title="Edit"><Edit2 size={13} /></button>
                  <button className={`${styles.actBtn} ${styles.red}`} onClick={() => setModalDelete(tx)} title="Hapus"><Trash2 size={13} /></button>
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

      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Transaksi">
        <TransactionForm initial={modalEdit} onSubmit={handleEdit} loading={submitting} />
      </Modal>

      <Modal open={!!modalDelete} onClose={() => setModalDelete(null)} title="Hapus Transaksi" size="sm">
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20 }}>
          Yakin ingin menghapus transaksi ini? Saldo tabungan akan dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setModalDelete(null)}>Batal</Button>
          <Button variant="danger" fullWidth loading={submitting} onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
