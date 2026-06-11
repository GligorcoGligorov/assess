import api from './api';

export interface PropertyFilters {
  city?: string;
  country?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export const propertyService = {
  getAll: async (filters?: PropertyFilters) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await api.post('/properties', data);
    return response.data;
  },

  update: async (id: string, data: Partial<any>) => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
};