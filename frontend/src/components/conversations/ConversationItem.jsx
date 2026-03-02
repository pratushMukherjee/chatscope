import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/formatters';

export default function ConversationItem({ conversation, onDelete }) {
  const { conversationId } = useParams();
  const isActive = parseInt(conversationId) === conversation.id;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative flex items-center rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Link
        to={`/c/${conversation.id}`}
        className="flex-1 px-3 py-2 min-w-0"
      >
        <p className={`text-sm truncate ${
          isActive
            ? 'text-primary-700 dark:text-primary-400 font-medium'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {conversation.title || 'New conversation'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatRelativeTime(conversation.updated_at)}
        </p>
      </Link>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
            <button
              onClick={() => {
                setShowMenu(false);
                onDelete(conversation.id);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
