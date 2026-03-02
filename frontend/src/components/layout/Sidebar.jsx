import { Link, useNavigate, useLocation } from 'react-router-dom';
import useUIStore from '../../store/uiStore';
import { useConversationList, useDeleteConversation } from '../../hooks/useConversations';
import ConversationItem from '../conversations/ConversationItem';
import Spinner from '../ui/Spinner';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const { data, isLoading } = useConversationList();
  const deleteMutation = useDeleteConversation();

  const handleNewChat = () => {
    setSidebarOpen(false);
    navigate('/');
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
    navigate('/');
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleNewChat}
            className="btn-primary w-full text-center"
          >
            + New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <Link
            to="/documents"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-3 ${
              location.pathname === '/documents'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents
          </Link>

          <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Conversations
          </p>

          {isLoading ? (
            <Spinner size="sm" className="mt-4" />
          ) : data?.conversations?.length > 0 ? (
            <div className="space-y-0.5">
              {data.conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <p className="px-3 text-sm text-gray-400 dark:text-gray-500 mt-2">
              No conversations yet
            </p>
          )}
        </nav>
      </aside>
    </>
  );
}
