import api from './client'

export const sharedSavingsApi = {
  list: (params) => api.get('/shared-savings', { params }),
  get: (id) => api.get(`/shared-savings/${id}`),
  create: (data) => api.post('/shared-savings', data),
  update: (id, data) => api.patch(`/shared-savings/${id}`, data),
  delete: (id) => api.delete(`/shared-savings/${id}`),
  join: (invite_code) => api.post('/shared-savings/join', { invite_code }),
  leave: (id) => api.delete(`/shared-savings/${id}/leave`),
  getMembers: (id) => api.get(`/shared-savings/${id}/members`),
  removeMember: (id, userId) => api.delete(`/shared-savings/${id}/members/${userId}`),
}

export const sharedTransactionsApi = {
  list: (id, params) => api.get(`/shared-savings/${id}/transactions`, { params }),
  create: (data) => api.post('/shared-transactions', data),
  update: (id, data) => api.patch(`/shared-transactions/${id}`, data),
  delete: (id) => api.delete(`/shared-transactions/${id}`),
}
