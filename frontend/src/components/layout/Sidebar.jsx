import { Link, useNavigate } from 'react-router-dom';
import useUIStore from '../../store/uiStore';
import { useConversationList, useDeleteConversation } from '../../hooks/useConversations';
import ConversationItem from '../conversations/ConversationItem';
import Spinner from '../ui/Spinner';

export default function Sidebar() {
  const navigate = useNavigate();
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
