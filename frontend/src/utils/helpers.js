/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @returns {string} e.g. "Rp 1.500.000"
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

/**
 * Format tanggal ke format lokal Indonesia
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format tanggal + jam
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Hitung persentase progress tabungan
 * @param {number} current
 * @param {number} target
 * @returns {number} 0â€“100
 */
export function calcProgress(current, target) {
  if (!target || target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/**
 * Ambil pesan error dari axios response
 * @param {any} err
 * @returns {string}
 */
export function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Terjadi kesalahan. Coba lagi.'
  )
}
