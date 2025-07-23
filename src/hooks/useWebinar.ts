import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateWebinar, CreateWebinarParticipant, CreateWebinarComment } from '@/models/webinar';
import { api } from '@/lib/api';

export function useWebinars(filters?: { status?: string; search?: string }) {
  const queryClient = useQueryClient();

  const { data: webinars, isLoading } = useQuery({
    queryKey: ['webinars', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/api/webinars?${params.toString()}`);
      return response.data;
    }
  });

  const createWebinar = useMutation({
    mutationFn: async (data: CreateWebinar) => {
      const response = await api.post('/api/webinars', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    }
  });

  const joinWebinar = useMutation({
    mutationFn: async (data: CreateWebinarParticipant) => {
      const response = await api.post('/api/webinars/participants', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webinars', variables.webinarId] });
    }
  });

  const addComment = useMutation({
    mutationFn: async (data: CreateWebinarComment) => {
      const response = await api.post('/api/webinars/comments', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webinars', variables.webinarId] });
    }
  });

  return {
    webinars,
    isLoading,
    createWebinar: createWebinar.mutate,
    joinWebinar: joinWebinar.mutate,
    addComment: addComment.mutate
  };
}

export function useWebinar(id: string) {
  const queryClient = useQueryClient();

  const { data: webinar, isLoading } = useQuery({
    queryKey: ['webinar', id],
    queryFn: async () => {
      const response = await api.get(`/api/webinars/${id}`);
      return response.data;
    }
  });

  const updateWebinar = useMutation({
    mutationFn: async (data: Partial<CreateWebinar>) => {
      const response = await api.put(`/api/webinars/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinar', id] });
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    }
  });

  const deleteWebinar = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/webinars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    }
  });

  return {
    webinar,
    isLoading,
    updateWebinar: updateWebinar.mutate,
    deleteWebinar: deleteWebinar.mutate
  };
} 