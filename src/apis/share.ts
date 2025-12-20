import axios from 'axios';
import type { ApiResponse } from '../types/agent';
import type { 
  CreateShareLinkRequest, 
  ShareLinkInfo, 
  SharedSessionResult 
} from '../types/share';

const API_URL = import.meta.env.VITE_API_URL || '';

export const createShareLink = async (request: CreateShareLinkRequest): Promise<ApiResponse<ShareLinkInfo>> => {
  const { data } = await axios.post(`${API_URL}/api/share/create`, request, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return data;
};

export const getSharedSessionResult = async (shareToken: string): Promise<ApiResponse<SharedSessionResult>> => {
  const { data } = await axios.get(`${API_URL}/api/share/${shareToken}`);
  return data;
};

export const deleteShareLink = async (shareToken: string): Promise<ApiResponse<string>> => {
  const { data } = await axios.delete(`${API_URL}/api/share/${shareToken}`);
  return data;
};

export const getSessionShareLinks = async (sessionId: string): Promise<ApiResponse<ShareLinkInfo[]>> => {
  const { data } = await axios.get(`${API_URL}/api/share/session/${sessionId}`);
  return data;
};

export const getShareLinkInfo = async (shareToken: string): Promise<ApiResponse<ShareLinkInfo>> => {
  const { data } = await axios.get(`${API_URL}/api/share/info/${shareToken}`);
  return data;
};