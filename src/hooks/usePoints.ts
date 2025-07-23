import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePoints } from '@/models/points';
import { api } from '@/lib/api';

export function usePoints(userId: string) {
  const queryClient = useQueryClient();

  const { data: points, isLoading } = useQuery({
    queryKey: ['points', userId],
    queryFn: async () => {
      const response = await api.get(`/api/auth/points?userId=${userId}`);
      return response.data;
    }
  });

  const addPoints = useMutation({
    mutationFn: async (data: CreatePoints) => {
      const response = await api.post('/api/auth/points', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points', userId] });
    }
  });

  return {
    points,
    isLoading,
    addPoints: addPoints.mutate
  };
} 