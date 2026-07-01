import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, PiggyBank, Edit2, Trash2, Eye } from 'lucide-react'
import { savingsApi } from '../api/savings'
import { formatRupiah, calcProgress, formatDate, getErrorMessage } from '../utils/helpers'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './SavingsPage.module.css'

function SavingsForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    target_amount: initial?.target_amount || '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nama tabungan wajib diisi'
    if (!form.target_amount || Number(form.target_amount) <= 0) e.target_amount = 'Target harus lebih dari 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: form.name, target_amount: Number(form.target_amount) })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Nama Tabungan"
        placeholder="Contoh: Dana Liburan Bali"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Gambar"
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
      />
      <Input
        label="Target Jumlah"
        type="number"
        placeholder="5000000"
        value={form.target_amount}
        onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
        error={errors.target_amount}
        prefix="Rp"
      />
      <Button type="submit" fullWidth loading={loading}>
        {initial ? 'Simpan Perubahan' : 'Buat Tabungan'}
      </Button>
    </form>
  )
}

export default function SavingsPage() {
  const [savings, setSavings] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalCreate, setModalCreate] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchSavings = useCallback(async (page = 1, q = search) => {
    setLoading(true)
    try {
      const { data } = await savingsApi.list({ page, limit: 9, search: q || undefined })
      setSavings(data.data.savings)
      setPagination(data.data.pagination)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => fetchSavings(1, search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleCreate = async (form) => {
    setSubmitting(true)
    try {
      await savingsApi.create(form)
      toast.success('Tabungan berhasil dibuat!')
      setModalCreate(false)
      fetchSavings(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (form) => {
    setSubmitting(true)
    try {
      await savingsApi.update(modalEdit.id, form)
      toast.success('Tabungan berhasil diperbarui!')
      setModalEdit(null)
      fetchSavings(pagination.page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await savingsApi.delete(modalDelete.id)
      toast.success('Tabungan berhasil dihapus!')
      setModalDelete(null)
      fetchSavings(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tabungan Pribadi</h1>
          <p className={styles.subtitle}>{pagination.total} tabungan</p>
        </div>
        <Button onClick={() => setModalCreate(true)}>
          <Plus size={16} /> Buat Tabungan
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="Cari tabungan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={15} />}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Memuat...</div>
      ) : savings.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Belum ada tabungan"
          description={search ? 'Tidak ada tabungan yang cocok dengan pencarian Anda.' : 'Mulai buat target tabungan pertama Anda!'}
          action={!search && <Button onClick={() => setModalCreate(true)}><Plus size={16} /> Buat Tabungan</Button>}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {savings.map((s) => {
              const progress = calcProgress(s.current_amount, s.target_amount)
              return (
                <div key={s.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      <PiggyBank size={18} />
                    </div>
                    <div className={styles.cardActions}>
                      <Link to={`/savings/${s.id}`} className={styles.actionBtn} title="Detail">
                        <Eye size={15} />
                      </Link>
                      <button className={styles.actionBtn} onClick={() => setModalEdit(s)} title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => setModalDelete(s)} title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <h3 className={styles.cardName}>{s.name}</h3>
                  <div className={styles.amounts}>
                    <span className={styles.current}>{formatRupiah(s.current_amount)}</span>
                    <span className={styles.target}>dari {formatRupiah(s.target_amount)}</span>
                  </div>
                  <ProgressBar value={progress} size="md" />
                  <p className={styles.cardDate}>Dibuat {formatDate(s.created_at)}</p>
                </div>
              )
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchSavings(pagination.page - 1)}
              >
                Sebelumnya
              </Button>
              <span className={styles.pageInfo}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSavings(pagination.page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={modalCreate} onClose={() => setModalCreate(false)} title="Buat Tabungan Baru">
        <SavingsForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Tabungan">
        <SavingsForm initial={modalEdit} onSubmit={handleEdit} loading={submitting} />
      </Modal>

      <Modal open={!!modalDelete} onClose={() => setModalDelete(null)} title="Hapus Tabungan" size="sm">
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20 }}>
          Yakin ingin menghapus tabungan <strong>"{modalDelete?.name}"</strong>?
          Semua transaksi terkait juga akan dihapus.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setModalDelete(null)}>Batal</Button>
          <Button variant="danger" fullWidth loading={submitting} onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
