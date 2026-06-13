import type { NoteResponse } from './note.types';

export interface GroupResponse {
  id: string;
  name: string;
  createdAt: string;
  notes: NoteResponse[];
}

export interface GroupAddRequest {
  groupName: string;
}

export interface GroupUpdateRequest {
  groupId: string;
  groupName: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}
