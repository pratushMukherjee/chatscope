import { useState, useRef, useEffect } from 'react';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants';
import DocumentChip from '../documents/DocumentChip';

export default function ChatInput({ onSend, isStreaming, onStop, attachedDocs = [], onToggleDoc, availableDocs = [] }) {
  const [message, setMessage] = useState('');
  const [showDocPicker, setShowDocPicker] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Attached documents */}
        {attachedDocs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedDocs.map((doc) => (
              <DocumentChip key={doc.id} document={doc} onRemove={onToggleDoc} />
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3">
          {/* Attach document button */}
          {availableDocs.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDocPicker(!showDocPicker)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Attach document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {showDocPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDocPicker(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px] max-h-[200px] overflow-y-auto">
                    {availableDocs.map((doc) => {
                      const isAttached = attachedDocs.some((d) => d.id === doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            onToggleDoc(doc.id);
                            setShowDocPicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <span className={`w-3 h-3 rounded border ${isAttached ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'}`} />
                          <span className="truncate">{doc.filename}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm max-h-[200px]"
            disabled={isStreaming}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex-shrink-0 p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex justify-between mt-1.5 px-1">
          <span className="text-xs text-gray-400">
            {message.length > 0 && `${message.length}/${MAX_MESSAGE_LENGTH}`}
          </span>
          <span className="text-xs text-gray-400">
            Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
}
