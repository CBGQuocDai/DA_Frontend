import axios from 'axios';
import { setupInterceptors } from './interceptor.config';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Áp dụng Interceptors
setupInterceptors(apiClient);

export default apiClient;
