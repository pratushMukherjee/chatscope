import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  deleteConversation,
  updateConversation,
} from '../api/conversations';
import toast from 'react-hot-toast';

export function useConversationList() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversation deleted');
    },
    onError: () => toast.error('Failed to delete conversation'),
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }) => updateConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
