import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages } from '../../api/messages';
import useChat from '../../hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ModelSelector from './ModelSelector';

export default function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [model, setModel] = useState('gpt-4o');
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  const {
    sendMessage,
    stopGeneration,
    streamingMessage,
    isStreaming,
    setActiveConversation,
  } = useChat();

  // Fetch messages for existing conversation
  const { data: messageData } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(parseInt(conversationId)),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(parseInt(conversationId));
    }
  }, [conversationId, setActiveConversation]);

  // Clear optimistic messages when real data arrives
  useEffect(() => {
    if (messageData && !isStreaming) {
      setOptimisticMessages([]);
    }
  }, [messageData, isStreaming]);

  const handleSend = useCallback(
    async (content) => {
      // Add optimistic user message
      const tempMsg = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setOptimisticMessages((prev) => [...prev, tempMsg]);

      const newConvId = await sendMessage(
        content,
        conversationId ? parseInt(conversationId) : null,
        model
      );

      if (newConvId && !conversationId) {
        navigate(`/c/${newConvId}`, { replace: true });
      }
    },
    [sendMessage, conversationId, model, navigate]
  );

  const allMessages = [...(messageData?.messages || []), ...optimisticMessages];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <ModelSelector value={model} onChange={setModel} />
      </div>

      {allMessages.length === 0 && !isStreaming ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start a conversation with AI. Ask questions, analyze documents, or explore ideas.
            </p>
          </div>
        </div>
      ) : (
        <MessageList
          messages={allMessages}
          streamingMessage={streamingMessage}
          isStreaming={isStreaming}
        />
      )}

      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stopGeneration}
      />
    </div>
  );
}
