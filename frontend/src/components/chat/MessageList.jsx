import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ messages, streamingMessage, isStreaming }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && !streamingMessage && <TypingIndicator />}
        {streamingMessage && <StreamingMessage content={streamingMessage} />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
