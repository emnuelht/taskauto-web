import api from './axiosInstance';
import type { NoteResponse, NoteAddRequest, NoteUpdateRequest, IAResponse } from '../types/note.types';
import type { ApiResponse } from '../types/group.types';

export const getNotes = async (groupId: string): Promise<NoteResponse[]> => {
  const { data } = await api.get<ApiResponse<NoteResponse[]>>(`/api/notes/${groupId}`);
  return data.data ?? [];
};

export const addNote = async (request: NoteAddRequest): Promise<void> => {
  await api.post('/api/note', request);
};

export const updateNote = async (noteId: string, request: NoteUpdateRequest): Promise<void> => {
  await api.put(`/api/note/${noteId}`, request);
};

export const deleteNote = async (noteId: string): Promise<void> => {
  await api.delete(`/api/note/${noteId}`);
};

export const processInput = async (text: string): Promise<IAResponse> => {
  const { data } = await api.post<ApiResponse<IAResponse>>('/api/input', { text });
  console.log(data);
  return data.data!;
};
