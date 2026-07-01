import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Trash2, Edit2 } from 'lucide-react'
import { savingsApi } from '../api/savings'
import { transactionsApi } from '../api/transactions'
import { formatRupiah, calcProgress, formatDateTime, getErrorMessage } from '../utils/helpers'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './SavingsDetailPage.module.css'

function TransactionForm({ savingsId, initial, onSubmit, loading }) {
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
    const payload = { type: form.type, amount: Number(form.amount), description: form.description }
    if (!initial) payload.savings_id = savingsId
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.txForm}>
      <div className={styles.typeToggle}>
        {['deposit', 'withdrawal'].map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.typeBtn} ${form.type === t ? styles[t] : ''}`}
            onClick={() => setForm({ ...form, type: t })}
          >
            {t === 'deposit' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {t === 'deposit' ? 'Setoran' : 'Penarikan'}
          </button>
        ))}
      </div>
      <Input
        label="Jumlah"
        type="number"
        placeholder="500000"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        error={errors.amount}
        prefix="Rp"
      />
      <Input
        label="Keterangan (opsional)"
        placeholder="Contoh: Gaji bulan Juni"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        hint="Maksimal 255 karakter"
      />
      <Button type="submit" fullWidth loading={loading}
        variant={form.type === 'deposit' ? 'success' : 'danger'}>
        {initial ? 'Simpan' : (form.type === 'deposit' ? 'Setor Dana' : 'Tarik Dana')}
      </Button>
    </form>
  )
}

export default function SavingsDetailPage() {
  const { id } = useParams()
  const [savings, setSavings] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [modalTx, setModalTx] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')

  const loadData = async (page = 1) => {
    try {
      const [sRes, tRes] = await Promise.all([
        savingsApi.get(id),
        savingsApi.getTransactions(id, { page, limit: 10, type: typeFilter || undefined }),
      ])
      setSavings(sRes.data.data.savings)
      setTransactions(tRes.data.data.transactions)
      setPagination(tRes.data.data.pagination)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData(1) }, [id, typeFilter])

  const handleCreateTx = async (form) => {
    setSubmitting(true)
    try {
      await transactionsApi.create(form)
      toast.success('Transaksi berhasil dicatat!')
      setModalTx(false)
      loadData(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTx = async (form) => {
    setSubmitting(true)
    try {
      await transactionsApi.update(modalEdit.id, form)
      toast.success('Transaksi berhasil diperbarui!')
      setModalEdit(null)
      loadData(pagination.page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTx = async () => {
    setSubmitting(true)
    try {
      await transactionsApi.delete(modalDelete.id)
      toast.success('Transaksi berhasil dihapus!')
      setModalDelete(null)
      loadData(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-3)' }}>Memuat...</div>
  if (!savings) return null

  const progress = calcProgress(savings.current_amount, savings.target_amount)

  return (
    <div className={styles.page}>
      <Link to="/savings" className={styles.back}>
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className={styles.topCard}>
        <div>
          <h1 className={styles.savingsName}>{savings.name}</h1>
          <p className={styles.savingsTarget}>Target: {formatRupiah(savings.target_amount)}</p>
        </div>
        <Button onClick={() => setModalTx(true)}>
          <Plus size={16} /> Tambah Transaksi
        </Button>
      </div>

      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <div>
            <p className={styles.progressLabel}>Terkumpul</p>
            <p className={styles.progressAmount}>{formatRupiah(savings.current_amount)}</p>
          </div>
          <div className={styles.progressBadge} style={{
            background: progress >= 100 ? 'var(--color-success-light)' : 'var(--color-primary-light)',
            color: progress >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
          }}>
            {progress >= 100 ? 'ðŸŽ‰ Tercapai!' : `${progress}%`}
          </div>
        </div>
        <ProgressBar value={progress} showLabel={false} size="lg" />
        <p className={styles.progressSub}>
          Sisa {formatRupiah(Math.max(savings.target_amount - savings.current_amount, 0))} lagi
        </p>
      </div>

      <div className={styles.txSection}>
        <div className={styles.txHeader}>
          <h2 className={styles.txTitle}>Riwayat Transaksi</h2>
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

        {transactions.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Belum ada transaksi"
            description="Mulai catat setoran atau penarikan pada tabungan ini."
          />
        ) : (
          <div className={styles.txList}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.txItem}>
                <div className={styles.txIcon} style={{
                  background: tx.type === 'deposit' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                  color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {tx.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className={styles.txInfo}>
                  <p className={styles.txDesc}>{tx.description || (tx.type === 'deposit' ? 'Setoran' : 'Penarikan')}</p>
                  <p className={styles.txDate}>{formatDateTime(tx.created_at)}</p>
                </div>
                <p className={styles.txAmt} style={{
                  color: tx.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                </p>
                <div className={styles.txActions}>
                  <button className={styles.actBtn} onClick={() => setModalEdit(tx)}><Edit2 size={13} /></button>
                  <button className={`${styles.actBtn} ${styles.red}`} onClick={() => setModalDelete(tx)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
              onClick={() => loadData(pagination.page - 1)}>Sebelumnya</Button>
            <span className={styles.pageInfo}>{pagination.page} / {pagination.totalPages}</span>
            <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadData(pagination.page + 1)}>Selanjutnya</Button>
          </div>
        )}
      </div>

      <Modal open={modalTx} onClose={() => setModalTx(false)} title="Tambah Transaksi">
        <TransactionForm savingsId={id} onSubmit={handleCreateTx} loading={submitting} />
      </Modal>

      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Transaksi">
        <TransactionForm savingsId={id} initial={modalEdit} onSubmit={handleEditTx} loading={submitting} />
      </Modal>

      <Modal open={!!modalDelete} onClose={() => setModalDelete(null)} title="Hapus Transaksi" size="sm">
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20 }}>
          Yakin ingin menghapus transaksi ini? Saldo tabungan akan dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setModalDelete(null)}>Batal</Button>
          <Button variant="danger" fullWidth loading={submitting} onClick={handleDeleteTx}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
