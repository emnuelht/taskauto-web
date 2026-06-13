import api from './axiosInstance';
import type { GroupResponse, GroupAddRequest, GroupUpdateRequest, ApiResponse } from '../types/group.types';

export const getGroups = async (): Promise<GroupResponse[]> => {
  const { data } = await api.get<ApiResponse<GroupResponse[]>>('/api/groups');
  return data.data ?? [];
};

export const addGroup = async (request: GroupAddRequest): Promise<void> => {
  await api.post('/api/group', request);
};

export const updateGroup = async (request: GroupUpdateRequest): Promise<void> => {
  await api.put('/api/group', request);
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await api.delete(`/api/group/${groupId}`);
};
