import api from './client'

export const savingsApi = {
  list: (params) => api.get('/savings', { params }),
  get: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
  getTransactions: (id, params) => api.get(`/savings/${id}/transactions`, { params }),
}
