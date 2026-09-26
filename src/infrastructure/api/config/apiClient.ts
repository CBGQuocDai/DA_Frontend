import axios from 'axios';
import { setupInterceptors } from './interceptor.config';

class ApiClient {
  private static instance: ApiClient | null = null;
  private client: ReturnType<typeof axios.create>;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setupInterceptors(this.client);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getClient() {
    return this.client;
  }
}

export const apiClient = ApiClient.getInstance().getClient();
export default apiClient;
