import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Eye, LogOut, Copy, Search } from 'lucide-react'
import { sharedSavingsApi } from '../api/shared'
import { formatRupiah, calcProgress, formatDate, getErrorMessage } from '../utils/helpers'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import styles from './SharedPage.module.css'

function CreateForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', description: '', target_amount: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nama wajib diisi'
    if (!form.target_amount || Number(form.target_amount) <= 0) e.target_amount = 'Target harus lebih dari 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: form.name, description: form.description, target_amount: Number(form.target_amount) })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input label="Nama Grup" placeholder="Contoh: Liburan Akhir Tahun" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
      <Input label="Deskripsi (opsional)" placeholder="Keterangan grup tabungan"
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Input label="Target Jumlah" type="number" placeholder="10000000"
        value={form.target_amount} prefix="Rp"
        onChange={(e) => setForm({ ...form, target_amount: e.target.value })} error={errors.target_amount} />
      <Button type="submit" fullWidth loading={loading}>Buat Grup</Button>
    </form>
  )
}

function JoinForm({ onSubmit, loading }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) { setError('Kode wajib diisi'); return }
    onSubmit(code.trim().toUpperCase())
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input label="Kode Undangan" placeholder="Contoh: A3F9B2C1" value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())} error={error}
        hint="Kode terdiri dari 8 karakter huruf dan angka" />
      <Button type="submit" fullWidth loading={loading}>Bergabung</Button>
    </form>
  )
}

export default function SharedPage() {
  const [groups, setGroups] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalCreate, setModalCreate] = useState(false)
  const [modalJoin, setModalJoin] = useState(false)
  const [modalLeave, setModalLeave] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchGroups = useCallback(async (page = 1, q = search) => {
    setLoading(true)
    try {
      const { data } = await sharedSavingsApi.list({ page, limit: 9, search: q || undefined })
      setGroups(data.data.shared_savings)
      setPagination(data.data.pagination)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => fetchGroups(1, search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleCreate = async (form) => {
    setSubmitting(true)
    try {
      await sharedSavingsApi.create(form)
      toast.success('Grup tabungan berhasil dibuat!')
      setModalCreate(false)
      fetchGroups(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (code) => {
    setSubmitting(true)
    try {
      await sharedSavingsApi.join(code)
      toast.success('Berhasil bergabung ke grup!')
      setModalJoin(false)
      fetchGroups(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeave = async () => {
    setSubmitting(true)
    try {
      await sharedSavingsApi.leave(modalLeave.id)
      toast.success('Berhasil keluar dari grup!')
      setModalLeave(null)
      fetchGroups(1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Kode disalin!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tabungan Bersama</h1>
          <p className={styles.subtitle}>{pagination.total} grup</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setModalJoin(true)}>
            <Users size={16} /> Gabung Grup
          </Button>
          <Button onClick={() => setModalCreate(true)}>
            <Plus size={16} /> Buat Grup
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input placeholder="Cari grup..." value={search}
          onChange={(e) => setSearch(e.target.value)} prefix={<Search size={15} />} />
      </div>

      {loading ? (
        <div className={styles.loading}>Memuat...</div>
      ) : groups.length === 0 ? (
        <EmptyState icon={Users} title="Belum ada grup tabungan"
          description={search ? 'Tidak ada grup yang cocok.' : 'Buat grup baru atau bergabung dengan kode undangan.'}
          action={!search && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={() => setModalJoin(true)}>Gabung Grup</Button>
              <Button onClick={() => setModalCreate(true)}>Buat Grup</Button>
            </div>
          )}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {groups.map((g) => {
              const progress = calcProgress(g.current_amount, g.target_amount)
              return (
                <div key={g.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}><Users size={18} /></div>
                    <span className={`${styles.roleBadge} ${g.role === 'owner' ? styles.owner : styles.member}`}>
                      {g.role === 'owner' ? 'Owner' : 'Anggota'}
                    </span>
                  </div>
                  <h3 className={styles.cardName}>{g.name}</h3>
                  {g.description && <p className={styles.cardDesc}>{g.description}</p>}
                  <div className={styles.amounts}>
                    <span className={styles.current}>{formatRupiah(g.current_amount)}</span>
                    <span className={styles.target}>dari {formatRupiah(g.target_amount)}</span>
                  </div>
                  <ProgressBar value={progress} size="md" />
                  <div className={styles.cardFooter}>
                    <div className={styles.inviteCode} onClick={() => copyCode(g.invite_code)} title="Klik untuk salin">
                      <Copy size={12} />
                      <span>{g.invite_code}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <Link to={`/shared/${g.id}`} className={styles.actionBtn} title="Detail">
                        <Eye size={15} />
                      </Link>
                      <button className={`${styles.actionBtn} ${styles.leave}`}
                        onClick={() => setModalLeave(g)} title="Keluar">
                        <LogOut size={15} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.cardDate}>{g.member_count ?? 0} anggota · Dibuat {formatDate(g.created_at)}</p>
                </div>
              )
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
                onClick={() => fetchGroups(pagination.page - 1)}>Sebelumnya</Button>
              <span className={styles.pageInfo}>{pagination.page} / {pagination.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchGroups(pagination.page + 1)}>Selanjutnya</Button>
            </div>
          )}
        </>
      )}

      <Modal open={modalCreate} onClose={() => setModalCreate(false)} title="Buat Grup Tabungan Bersama">
        <CreateForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal open={modalJoin} onClose={() => setModalJoin(false)} title="Gabung dengan Kode Undangan">
        <JoinForm onSubmit={handleJoin} loading={submitting} />
      </Modal>

      <Modal open={!!modalLeave} onClose={() => setModalLeave(null)} title="Keluar dari Grup" size="sm">
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20 }}>
          Yakin ingin keluar dari grup <strong>"{modalLeave?.name}"</strong>?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setModalLeave(null)}>Batal</Button>
          <Button variant="danger" fullWidth loading={submitting} onClick={handleLeave}>Keluar</Button>
        </div>
      </Modal>
    </div>
  )
}
