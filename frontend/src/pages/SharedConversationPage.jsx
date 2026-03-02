import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedConversation } from '../api/share';
import MessageBubble from '../components/chat/MessageBubble';
import Spinner from '../components/ui/Spinner';

export default function SharedConversationPage() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared', slug],
    queryFn: () => getSharedConversation(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Conversation not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            This shared conversation may have been removed or the link is invalid.
          </p>
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign in to ChatScope
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">CS</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                {data.title || 'Shared Conversation'}
              </h1>
              <p className="text-xs text-gray-400">
                Shared via ChatScope
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Try ChatScope
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4 space-y-4">
        {data.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </main>
    </div>
  );
}
