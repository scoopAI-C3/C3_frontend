import axios from 'axios';
import type {
  ApiResponse,
  SessionStartResult,
  SessionObserveResult,
  SessionObserveRequest,
  SessionAnalyzeResult,
  SessionAnalyzeRequest,
  SessionResultData,
  RecentSessionsResult,
  AICollaborationType,
  AICollaborationTypeListResult,
  AICollaborationTypeDetail,
  SurveyResultData,
  SessionGraphData
} from '../types/agent';

const API_URL = import.meta.env.VITE_API_URL || '';

export const startSession = async (): Promise<ApiResponse<SessionStartResult>> => {
  const { data } = await axios.post(`${API_URL}/api/session/start`, {}, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return data;
};

export const observeSession = async (request: SessionObserveRequest): Promise<ApiResponse<SessionObserveResult>> => {
  const { data } = await axios.post(`${API_URL}/api/session/observe`, request);
  return data;
};

export const analyzeSession = async (request: SessionAnalyzeRequest): Promise<ApiResponse<SessionAnalyzeResult>> => {
  const { data } = await axios.post(`${API_URL}/api/session/analyze`, request);
  return data;
};

export const getSessionResult = async (sessionId: string, language?: string): Promise<ApiResponse<SessionResultData>> => {
  const params = language === 'en' ? { language: 'en' } : {};
  const { data } = await axios.get(`${API_URL}/api/session/result/${sessionId}`, { params });
  return data;
};

export const getRecentSessions = async (limit: number = 5): Promise<ApiResponse<RecentSessionsResult>> => {
  const { data } = await axios.get(`${API_URL}/api/session/recent`, { params: { limit } });
  return data;
};

export const getAICollaborationTypes = async (): Promise<ApiResponse<AICollaborationTypeListResult>> => {
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types`);
  return data;
};

export const getAICollaborationType = async (typeCode: string): Promise<ApiResponse<AICollaborationType>> => {
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types/${typeCode}`);
  return data;
};

export const checkAICollaborationTypeExists = async (typeCode: string): Promise<ApiResponse<boolean>> => {
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types/${typeCode}/exists`);
  return data;
};

export const getAICollaborationTypeDetail = async (typeCode: string): Promise<ApiResponse<AICollaborationTypeDetail>> => {
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types/${typeCode}/detail`);
  return data;
};

export const getAllAICollaborationTypesDetails = async (): Promise<ApiResponse<AICollaborationTypeDetail[]>> => {
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types/all/details`);
  return data;
};

export const getSurveyResult = async (typeCode: string, language?: string): Promise<ApiResponse<SurveyResultData>> => {
  const params = language === 'en' ? { language: 'en' } : {};
  const { data } = await axios.get(`${API_URL}/api/ai-collaboration-types/${typeCode}/survey-result`, { params });
  return data;
};

export const getSessionGraph = async (sessionId: string, language?: string): Promise<ApiResponse<SessionGraphData>> => {
  const params = language === 'en' ? { language: 'en' } : {};
  const { data } = await axios.get(`${API_URL}/api/session/graph/${sessionId}`, { params });
  return data;
};
