import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePoll, CreatePollVote } from '@/models/poll';
import { api } from '@/lib/api';

export function usePolls(filters?: { status?: string; search?: string }) {
  const queryClient = useQueryClient();

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/api/polls?${params.toString()}`);
      return response.data;
    }
  });

  const createPoll = useMutation({
    mutationFn: async (data: CreatePoll) => {
      const response = await api.post('/api/polls', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    }
  });

  const submitVote = useMutation({
    mutationFn: async (data: CreatePollVote) => {
      const response = await api.post('/api/polls/submit', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls', variables.pollId] });
    }
  });

  return {
    polls,
    isLoading,
    createPoll: createPoll.mutate,
    submitVote: submitVote.mutate
  };
}

export function usePoll(id: string) {
  const queryClient = useQueryClient();

  const { data: poll, isLoading } = useQuery({
    queryKey: ['poll', id],
    queryFn: async () => {
      const response = await api.get(`/api/polls/${id}`);
      return response.data;
    }
  });

  const updatePoll = useMutation({
    mutationFn: async (data: Partial<CreatePoll>) => {
      const response = await api.put(`/api/polls/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', id] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    }
  });

  const deletePoll = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/polls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    }
  });

  return {
    poll,
    isLoading,
    updatePoll: updatePoll.mutate,
    deletePoll: deletePoll.mutate
  };
} 