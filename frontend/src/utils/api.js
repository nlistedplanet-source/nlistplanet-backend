import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Configure axios
axios.defaults.baseURL = API_URL;

// Listings API
export const listingsAPI = {
  getAll: (params) => axios.get('/listings', { params }),
  getMy: (params) => axios.get('/listings/my', { params }),
  create: (data) => axios.post('/listings', data),
  placeBid: (id, data) => axios.post(`/listings/${id}/bid`, data),
  boost: (id) => axios.put(`/listings/${id}/boost`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/read-all'),
};

// Companies API
export const companiesAPI = {
  getAll: (params) => axios.get('/companies', { params }),
  getById: (id) => axios.get(`/companies/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getMyEarnings: () => axios.get('/transactions/my-earnings'),
};

// Referrals API
export const referralsAPI = {
  getMyReferrals: () => axios.get('/referrals/my-referrals'),
};

// Admin API
export const adminAPI = {
  getStats: () => axios.get('/admin/stats'),
  getUsers: (params) => axios.get('/admin/users', { params }),
  banUser: (id) => axios.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => axios.put(`/admin/users/${id}/unban`),
  createCompany: (data) => axios.post('/admin/companies', data),
};

export default axios;
