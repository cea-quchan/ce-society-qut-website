import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateChatGroup, CreateChatMessage, CreateChatGroupMember } from '@/models/chat';
import { api } from '@/lib/api';

export function useChatGroups(userId: string) {
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['chatGroups', userId],
    queryFn: async () => {
      const response = await api.get(`/api/chat/groups?userId=${userId}`);
      return response.data;
    }
  });

  const createGroup = useMutation({
    mutationFn: async (data: CreateChatGroup) => {
      const response = await api.post('/api/chat/groups', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatGroups', userId] });
    }
  });

  const addMember = useMutation({
    mutationFn: async (data: CreateChatGroupMember) => {
      const response = await api.post('/api/chat/groups/members', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatGroups', userId] });
    }
  });

  return {
    groups,
    isLoading,
    createGroup: createGroup.mutate,
    addMember: addMember.mutate
  };
}

export function useChatMessages(groupId: string) {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['chatMessages', groupId],
    queryFn: async () => {
      const response = await api.get(`/api/chat/messages?groupId=${groupId}`);
      return response.data;
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (data: CreateChatMessage) => {
      const response = await api.post('/api/chat/messages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', groupId] });
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate
  };
} 