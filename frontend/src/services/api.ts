import axios, { InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  Unit,
  PedagogyType,
  ContentType,
} from '../types/index';

// Same origin - backend serves both API and frontend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Don't set Content-Type - let axios handle it based on the data type
  // axios will automatically set:
  // - application/json for objects
  // - application/x-www-form-urlencoded for URLSearchParams
  // - multipart/form-data for FormData

  return config;
});

// Auth endpoints - now using simple JSON
export const login = (email: string, password: string): Promise<ApiResponse> =>
  api.post('/auth/login', { email, password });

export const register = (
  email: string,
  password: string,
  name: string
): Promise<ApiResponse> =>
  api.post('/auth/register', { email, password, name });

// Content endpoints (AI-powered)
export const generateContent = (
  type: ContentType,
  pedagogy: PedagogyType,
  topic: string
): Promise<ApiResponse> =>
  api.post('/ai/generate', {
    content_type: type,
    pedagogy_style: pedagogy,
    topic,
  });

export const enhanceContent = (
  content: string,
  pedagogy: PedagogyType
): Promise<ApiResponse> =>
  api.post('/ai/enhance', {
    content,
    enhancement_type: 'improve',
    pedagogy_style: pedagogy,
  });

// Unit endpoints
export const getUnits = (): Promise<ApiResponse<Unit[]>> => api.get('/units');
export const getUnit = (id: string): Promise<ApiResponse<Unit>> =>
  api.get(`/units/${id}`);

// Backwards compatibility aliases
export const getCourses = getUnits;
export const getCourse = getUnit;
export const createUnit = (data: Partial<Unit>): Promise<ApiResponse<Unit>> =>
  api.post('/units/create', data);
export const updateUnit = (
  id: string,
  data: Partial<Unit>
): Promise<ApiResponse<Unit>> => api.put(`/units/${id}`, data);

export const deleteUnit = (id: string): Promise<ApiResponse> =>
  api.delete(`/units/${id}`);

// Content management
export const getContents = (unitId?: string): Promise<ApiResponse> => {
  const params = unitId ? `?unit_id=${unitId}` : '';
  return api.get(`/content${params}`);
};

export const getContent = (contentId: string): Promise<ApiResponse> =>
  api.get(`/content/${contentId}`);

export const createContent = (data: {
  title: string;
  type: string;
  unit_id: string;
  content_markdown?: string;
  summary?: string;
  difficulty_level?: string;
  estimated_duration_minutes?: number;
}): Promise<ApiResponse> => api.post('/content', data);

export const updateContent = (
  contentId: string,
  data: {
    title?: string;
    content_markdown?: string;
    summary?: string;
    difficulty_level?: string;
    estimated_duration_minutes?: number;
  }
): Promise<ApiResponse> => api.put(`/content/${contentId}`, data);

export const deleteContent = (contentId: string): Promise<ApiResponse> =>
  api.delete(`/content/${contentId}`);

// File upload
export const uploadFile = (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
export { api };
