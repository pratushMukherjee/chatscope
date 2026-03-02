import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useChatStore from '../store/chatStore';
import { API_BASE_URL } from '../utils/constants';

export default function useChat() {
  const abortRef = useRef(null);
  const queryClient = useQueryClient();
  const {
    activeConversationId,
    streamingMessage,
    isStreaming,
    setActiveConversation,
    setStreamingMessage,
    appendStreamingMessage,
    setIsStreaming,
    clearStreaming,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content, conversationId = null, model = 'gpt-4o', documentIds = []) => {
      setIsStreaming(true);
      setStreamingMessage('');

      abortRef.current = new AbortController();

      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const token = authData?.state?.accessToken;

      try {
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            content,
            model,
            document_ids: documentIds,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let newConversationId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                if (newConversationId) {
                  queryClient.invalidateQueries({
                    queryKey: ['messages', newConversationId],
                  });
                }
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content') {
                    appendStreamingMessage(parsed.text);
                  } else if (parsed.type === 'conversation') {
                    newConversationId = parsed.conversation_id;
                    setActiveConversation(parsed.conversation_id);
                  } else if (parsed.type === 'error') {
                    toast.error(parsed.message);
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        }

        return newConversationId;
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error(err.message || 'Failed to send message');
        }
        return null;
      } finally {
        clearStreaming();
      }
    },
    [setIsStreaming, setStreamingMessage, appendStreamingMessage, setActiveConversation, clearStreaming, queryClient]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    sendMessage,
    stopGeneration,
    streamingMessage,
    isStreaming,
    activeConversationId,
    setActiveConversation,
  };
}
