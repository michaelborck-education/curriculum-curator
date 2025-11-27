import axios, { InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  Unit,
  PedagogyType,
  ContentType,
} from '../types/index';

// Same origin - backend serves both API and frontend
const API_BASE_URL = '/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Found' : 'Not found');
  console.log('Request URL:', config.url);
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added Authorization header');
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

// Content endpoints
export const generateContent = (
  type: ContentType,
  pedagogy: PedagogyType,
  context: string
): Promise<ApiResponse> =>
  api.post('/llm/generate', {
    content_type: type,
    pedagogy_style: pedagogy,
    context,
  });

export const enhanceContent = (
  content: string,
  pedagogy: PedagogyType
): Promise<ApiResponse> =>
  api.post('/llm/enhance', { content, pedagogy_style: pedagogy });

// Unit endpoints
export const getUnits = (): Promise<ApiResponse<Unit[]>> =>
  api.get('/units');
export const getUnit = (id: string): Promise<ApiResponse<Unit>> =>
  api.get(`/api/units/${id}`);

// Backwards compatibility aliases
export const getCourses = getUnits;
export const getCourse = getUnit;
export const createUnit = (data: Partial<Unit>): Promise<ApiResponse<Unit>> =>
  api.post('/units', data);
export const updateUnit = (
  id: string,
  data: Partial<Unit>
): Promise<ApiResponse<Unit>> => api.put(`/api/units/${id}`, data);

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
