import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  DashboardStats,
  PaginatedResponse,
  PaginationParams,
} from '@/src/shared/types';
import { User } from '@/src/shared/types';

export const dashboardService = {
  /**
   * Get dashboard statistics (Admin)
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>(
      API_ENDPOINTS.DASHBOARD.STATS
    );
    return response.data;
  },

  /**
   * Get top selling books (Admin)
   */
  getTopBooks: async (limit = 10): Promise<DashboardStats['topBooks']> => {
    const response = await apiClient.get<DashboardStats['topBooks']>(
      API_ENDPOINTS.DASHBOARD.TOP_BOOKS,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get recent reviews (Admin)
   */
  getRecentReviews: async (limit = 10): Promise<DashboardStats['recentReviews']> => {
    const response = await apiClient.get<DashboardStats['recentReviews']>(
      API_ENDPOINTS.DASHBOARD.RECENT_REVIEWS,
      { params: { limit } }
    );
    return response.data;
  },
};

export const userService = {
  /**
   * Get all users (Admin)
   */
  getUsers: async (
    params?: PaginationParams & { role?: string; keyword?: string }
  ): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USERS.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Get user by ID (Admin)
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(
      API_ENDPOINTS.USERS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Update user (Admin)
   */
  updateUser: async (
    id: string,
    data: Partial<User>
  ): Promise<User> => {
    const response = await apiClient.put<User>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete user (Admin)
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },
};

export default dashboardService;
