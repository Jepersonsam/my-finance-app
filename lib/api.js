import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// Transaction API
export const transactionAPI = {
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  create: async (transaction) => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },
  update: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/transactions', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

// Budget API
export const budgetAPI = {
  getAll: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },
  create: async (budget) => {
    const response = await api.post('/budgets', budget);
    return response.data;
  },
  update: async (id, budget) => {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

// Savings API
export const savingsAPI = {
  getAll: async () => {
    const response = await api.get('/savings');
    return response.data;
  },
  create: async (saving) => {
    const response = await api.post('/savings', saving);
    return response.data;
  },
  update: async (id, saving) => {
    const response = await api.put(`/savings/${id}`, saving);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
  },
};

// Installment API
export const installmentAPI = {
  getAll: async () => {
    const response = await api.get('/installments');
    return response.data;
  },
  create: async (installment) => {
    const response = await api.post('/installments', installment);
    return response.data;
  },
  update: async (id, installment) => {
    const response = await api.put(`/installments/${id}`, installment);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/installments/${id}`);
    return response.data;
  },
};

// Debt API
export const debtAPI = {
  getAll: async () => {
    const response = await api.get('/debts');
    return response.data;
  },
  create: async (debt) => {
    const response = await api.post('/debts', debt);
    return response.data;
  },
  update: async (id, debt) => {
    const response = await api.put(`/debts/${id}`, debt);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
  },
};

export default api;
