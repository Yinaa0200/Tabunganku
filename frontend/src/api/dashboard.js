import api from './client'

export const dashboardApi = {
  get: () => api.get('/dashboard'),
  getActivity: (params) => api.get('/dashboard/recent-transactions', { params }),
}