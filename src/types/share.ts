import type { SessionResultData } from './agent';

export interface CreateShareLinkRequest {
  sessionId: string;
  expiresInHours: number;
}

export interface ShareLinkInfo {
  shareToken: string;
  shareUrl: string;
  sessionId: string;
  expiresAt: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

export interface SharedPageMeta {
  shareToken: string;
  sharedAt: string;
  viewCount: number;
}

export interface SharedSessionResult {
  shareInfo: SharedPageMeta;
  result: SessionResultData;
}