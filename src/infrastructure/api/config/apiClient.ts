import axios from 'axios';
import { API_BASE_URL } from '@/src/shared/constants';
import { setupInterceptors } from './interceptor.config';

class ApiClient {
  private static instance: ApiClient | null = null;
  private client: ReturnType<typeof axios.create>;

  private constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
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

/** Most endpoints wrap the payload as `{ code, message, data }`; a few return it bare. */
export const unwrap = <T>({ data: body }: { data: unknown }): T =>
  ((body as { data?: T } | undefined)?.data ?? body) as T;
