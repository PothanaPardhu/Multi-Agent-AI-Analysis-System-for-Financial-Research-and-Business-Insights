import axios from 'axios';
import type { Session, SessionCreateInput, DocumentMeta , CompanyExtractionRow , RedFlagAlert } from '../types';



const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Session / Workspace Endpoints
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<Session[]>('/sessions');
    return response.data;
  },

  createSession: async (payload: SessionCreateInput): Promise<Session> => {
    const response = await apiClient.post<Session>('/sessions', payload);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const response = await apiClient.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  },

  // Document Ingestion Endpoints
  getSessionDocuments: async (sessionId: string): Promise<DocumentMeta[]> => {
    const response = await apiClient.get<DocumentMeta[]>(`/sessions/${sessionId}/documents`);
    return response.data;
  },

  // Extraction Agent (A2) Endpoint
  getExtractionMatrix: async (sessionId: string): Promise<CompanyExtractionRow[]> => {
    const response = await apiClient.get<CompanyExtractionRow[]>(
      `/sessions/${sessionId}/extraction/matrix`
    );
    return response.data;
  },
  
  // Red Flag Agent (A3) Endpoint
  getRedFlags: async (sessionId: string): Promise<RedFlagAlert[]> => {
    const response = await apiClient.get<RedFlagAlert[]>(
      `/sessions/${sessionId}/red-flags`
    );
    return response.data;
  },

  uploadDocument: async (
    sessionId: string,
    file: File,
    companyName: string,
    filingType: string = '10-K',
    fiscalYear?: string
  ): Promise<DocumentMeta> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_name', companyName);
    formData.append('filing_type', filingType);
    if (fiscalYear) {
      formData.append('fiscal_year', fiscalYear);
    }

    const response = await apiClient.post<DocumentMeta>(
      `/sessions/${sessionId}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};