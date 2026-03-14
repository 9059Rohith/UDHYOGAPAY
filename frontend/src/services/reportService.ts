import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { CancellationReport } from '../types/report.types';

export const reportService = {
  getCancellationReport: async (): Promise<CancellationReport> => {
    const response = await api.get<ApiResponse<CancellationReport>>('/reports/cancellations/summary');
    if (!response.data.data) {
      throw new Error('Cancellation report payload is missing');
    }
    return response.data.data;
  },

  downloadPaymentSummaryCsv: async (): Promise<Blob> => {
    const response = await api.get('/reports/payments/summary', {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  triggerPaymentSummaryDownload: async (filename = 'payment-summary.csv'): Promise<void> => {
    const blob = await reportService.downloadPaymentSummaryCsv();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }
};

export default reportService;
