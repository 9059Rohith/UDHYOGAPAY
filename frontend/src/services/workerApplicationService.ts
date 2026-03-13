// Service layer: handles workerApplicationService API calls and request logic.
import api from './api';

export interface WorkerApplicationData {
  name: string;
  personalEmail: string;
  phone: string;
  profession: string;
  experience: number;
  address: string;
  documents?: {
    aadhar?: {
      url: string;
      uploadedAt: Date;
    };
    policeVerification?: {
      url: string;
      uploadedAt: Date;
    };
  };
}

export interface ApproveApplicationData {
  workEmail: string;
}

export const submitWorkerApplication = async (data: WorkerApplicationData | FormData) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.post('/worker-applications/submit', data, { headers });
  return response.data;
};

export const getPendingApplications = async () => {
  const response = await api.get('/worker-applications/pending');
  return response.data;
};

export const approveApplication = async (id: string, data: ApproveApplicationData) => {
  const response = await api.post(`/worker-applications/${id}/approve`, data);
  return response.data;
};

export const rejectApplication = async (id: string, reason: string) => {
  const response = await api.post(`/worker-applications/${id}/reject`, { reason });
  return response.data;
};

export const checkApplicationStatus = async (email: string) => {
  const response = await api.post('/worker-applications/check-status', { email });
  return response.data;
};
