import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateLibraryResource, CreateLibraryComment } from '@/models/library';
import { api } from '@/lib/api';

export function useLibraryResources(filters?: { category?: string; search?: string }) {
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['libraryResources', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/api/library?${params.toString()}`);
      return response.data;
    }
  });

  const createResource = useMutation({
    mutationFn: async (data: CreateLibraryResource) => {
      const response = await api.post('/api/library', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryResources'] });
    }
  });

  const addComment = useMutation({
    mutationFn: async (data: CreateLibraryComment) => {
      const response = await api.post('/api/library/comments', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['libraryResources', variables.resourceId] });
    }
  });

  return {
    resources,
    isLoading,
    createResource: createResource.mutate,
    addComment: addComment.mutate
  };
}

export function useLibraryResource(id: string) {
  const queryClient = useQueryClient();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['libraryResource', id],
    queryFn: async () => {
      const response = await api.get(`/api/library/${id}`);
      return response.data;
    }
  });

  const updateResource = useMutation({
    mutationFn: async (data: Partial<CreateLibraryResource>) => {
      const response = await api.put(`/api/library/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryResource', id] });
      queryClient.invalidateQueries({ queryKey: ['libraryResources'] });
    }
  });

  const deleteResource = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryResources'] });
    }
  });

  return {
    resource,
    isLoading,
    updateResource: updateResource.mutate,
    deleteResource: deleteResource.mutate
  };
} 