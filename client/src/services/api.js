import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Board APIs
export const boardAPI = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data)
};

// List APIs
export const listAPI = {
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  reorder: (lists) => api.put('/lists/reorder', { lists }),
  delete: (id) => api.delete(`/lists/${id}`)
};

// Card APIs
export const cardAPI = {
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  move: (data) => api.put('/cards/move', data),
  archive: (id, archived) => api.put(`/cards/${id}/archive`, { archived }),
  delete: (id) => api.delete(`/cards/${id}`),
  search: (query, boardId) => api.get('/cards/search', { params: { q: query, boardId } })
};

// Label APIs
export const labelAPI = {
  getAll: (boardId) => api.get(`/labels/${boardId}`),
  create: (data) => api.post('/labels', data),
  addToCard: (cardId, labelId) => api.post(`/labels/cards/${cardId}/labels/${labelId}`),
  removeFromCard: (cardId, labelId) => api.delete(`/labels/cards/${cardId}/labels/${labelId}`)
};

// Member APIs
export const memberAPI = {
  getAll: () => api.get('/members'),
  addToCard: (cardId, memberId) => api.post(`/members/cards/${cardId}/members/${memberId}`),
  removeFromCard: (cardId, memberId) => api.delete(`/members/cards/${cardId}/members/${memberId}`)
};

// Checklist APIs
export const checklistAPI = {
  create: (data) => api.post('/checklists', data),
  addItem: (checklistId, data) => api.post(`/checklists/${checklistId}/items`, data),
  updateItem: (itemId, data) => api.put(`/checklists/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/checklists/items/${itemId}`),
  delete: (id) => api.delete(`/checklists/${id}`)
};

export default api;
