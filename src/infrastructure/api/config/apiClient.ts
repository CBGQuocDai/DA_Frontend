import axios from 'axios';
import { setupInterceptors } from './interceptor.config';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Áp dụng Interceptors
setupInterceptors(apiClient);

export default apiClient;
