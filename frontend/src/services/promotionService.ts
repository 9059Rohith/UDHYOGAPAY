import api from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  CreatePromotionPayload,
  Promotion,
  UpdatePromotionPayload,
  ValidatePromotionPayload,
  ValidatePromotionResult
} from '../types/promotion.types';

export const promotionService = {
  getAll: async (): Promise<Promotion[]> => {
    const response = await api.get<ApiResponse<Promotion[]>>('/promotions');
    return response.data.data ?? [];
  },

  getById: async (id: string): Promise<Promotion> => {
    const response = await api.get<ApiResponse<Promotion>>(`/promotions/${id}`);
    if (!response.data.data) {
      throw new Error('Promotion not found');
    }
    return response.data.data;
  },

  create: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    const response = await api.post<ApiResponse<Promotion>>('/promotions', payload);
    if (!response.data.data) {
      throw new Error('Failed to create promotion');
    }
    return response.data.data;
  },

  update: async (id: string, payload: UpdatePromotionPayload): Promise<Promotion> => {
    const response = await api.patch<ApiResponse<Promotion>>(`/promotions/${id}`, payload);
    if (!response.data.data) {
      throw new Error('Failed to update promotion');
    }
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },

  toggleActive: async (promotion: Promotion): Promise<Promotion> => {
    return promotionService.update(promotion._id, { isActive: !promotion.isActive });
  },

  validateAndApply: async (payload: ValidatePromotionPayload): Promise<ValidatePromotionResult> => {
    const response = await api.post<ApiResponse<ValidatePromotionResult>>(
      '/promotions/validate-apply',
      payload
    );

    if (!response.data.data) {
      throw new Error('Invalid promotion result');
    }

    return response.data.data;
  }
};

export default promotionService;
