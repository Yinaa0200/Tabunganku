import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Users, Trash2, Edit2, Copy } from 'lucide-react'
import { sharedSavingsApi, sharedTransactionsApi } from '../api/shared'
import { useAuth } from '../context/AuthContext'
import { formatRupiah, calcProgress, formatDateTime, getErrorMessage } from '../utils/helpers'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './SharedDetailPage.module.css'

function TxForm({ groupId, initial, onSubmit, loading }) {
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
    if (!initial) payload.shared_savings_id = groupId
    onSubmit(payload)
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
      <Input label="Keterangan (opsional)" placeholder="Kontribusi bulan ini"
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button type="submit" fullWidth loading={loading}
        variant={form.type === 'deposit' ? 'success' : 'danger'}>
        {initial ? 'Simpan' : (form.type === 'deposit' ? 'Setor Dana' : 'Tarik Dana')}
      </Button>
    </form>
  )
}

export default function SharedDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [modalTx, setModalTx] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async (page = 1) => {
    try {
      const [gRes, mRes, tRes] = await Promise.all([
        sharedSavingsApi.get(id),
        sharedSavingsApi.getMembers(id),
        sharedTransactionsApi.list(id, { page, limit: 10 }),
      ])
      setGroup(gRes.data.data.shared_savings)
      setMembers(mRes.data.data.members || [])
      setTransactions(tRes.data.data.transactions)
      setPagination(tRes.data.data.pagination)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData(1) }, [id])

  const handleCreateTx = async (form) => {
    setSubmitting(true)
    try {
      await sharedTransactionsApi.create(form)
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
      await sharedTransactionsApi.update(modalEdit.id, form)
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
      await sharedTransactionsApi.delete(modalDelete.id)
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
  if (!group) return null

  const progress = calcProgress(group.current_amount, group.target_amount)
  const copyCode = () => { navigator.clipboard.writeText(group.invite_code); toast.success('Kode disalin!') }

  return (
    <div className={styles.page}>
      <Link to="/shared" className={styles.back}><ArrowLeft size={16} /> Kembali</Link>

      <div className={styles.topCard}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className={styles.groupName}>{group.name}</h1>
          </div>
          {group.description && <p className={styles.groupDesc}>{group.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={styles.codeBtn} onClick={copyCode}>
            <Copy size={13} /> {group.invite_code}
          </button>
          <Button onClick={() => setModalTx(true)}><Plus size={16} /> Tambah Transaksi</Button>
        </div>
      </div>

      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <div>
            <p className={styles.progressLabel}>Terkumpul</p>
            <p className={styles.progressAmount}>{formatRupiah(group.current_amount)}</p>
          </div>
          <div className={styles.progressBadge} style={{
            background: progress >= 100 ? 'var(--color-success-light)' : '#F0F0FF',
            color: progress >= 100 ? 'var(--color-success)' : '#4F46E5',
          }}>
            {progress >= 100 ? 'ðŸŽ‰ Tercapai!' : `${progress}%`}
          </div>
        </div>
        <ProgressBar value={progress} showLabel={false} size="lg" />
        <p className={styles.progressSub}>Target: {formatRupiah(group.target_amount)}</p>
      </div>

      <div className={styles.membersCard}>
        <h2 className={styles.sectionTitle}><Users size={16} /> Anggota ({members.length})</h2>
        <div className={styles.memberList}>
          {members.map((m) => (
            <div key={m.id} className={styles.memberItem}>
              <div className={styles.memberAvatar}>{(m.name || m.email || '?').charAt(0).toUpperCase()}</div>
              <div className={styles.memberInfo}>
                <p className={styles.memberName}>{m.name || m.email}</p>
                <p className={styles.memberRole}>{m.role === 'owner' ? 'Owner' : 'Anggota'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.txSection}>
        <div className={styles.txHeader}>
          <h2 className={styles.sectionTitle}>Riwayat Transaksi</h2>
        </div>
        {transactions.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Belum ada transaksi" description="Mulai catat setoran atau penarikan untuk grup ini." />
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
        <TxForm groupId={id} onSubmit={handleCreateTx} loading={submitting} />
      </Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Transaksi">
        <TxForm groupId={id} initial={modalEdit} onSubmit={handleEditTx} loading={submitting} />
      </Modal>
      <Modal open={!!modalDelete} onClose={() => setModalDelete(null)} title="Hapus Transaksi" size="sm">
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20 }}>
          Yakin ingin menghapus transaksi ini? Saldo grup akan dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setModalDelete(null)}>Batal</Button>
          <Button variant="danger" fullWidth loading={submitting} onClick={handleDeleteTx}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
