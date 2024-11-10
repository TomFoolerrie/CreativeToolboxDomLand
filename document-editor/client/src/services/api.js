import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getDocuments = () => api.get('/documents');
export const getDocument = (id) => api.get(`/documents/${id}`);
export const createDocument = (data) => api.post('/documents', data);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);