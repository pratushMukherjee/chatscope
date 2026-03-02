import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { toggleShare } from '../../api/share';
import Button from '../ui/Button';

export default function ShareDialog({ conversation, onClose }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const shareMutation = useMutation({
    mutationFn: () => toggleShare(conversation.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (data.is_shared) {
        toast.success('Conversation shared!');
      } else {
        toast.success('Sharing disabled');
      }
    },
  });

  const shareUrl = conversation.share_slug
    ? `${window.location.origin}/share/${conversation.share_slug}`
    : null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Share Conversation
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {conversation.is_shared
            ? 'This conversation is shared publicly. Anyone with the link can view it.'
            : 'Share this conversation via a public link. Others can view but not edit.'}
        </p>

        {conversation.is_shared && shareUrl && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="input-field text-sm flex-1"
            />
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={conversation.is_shared ? 'danger' : 'primary'}
            loading={shareMutation.isPending}
            onClick={() => shareMutation.mutate()}
          >
            {conversation.is_shared ? 'Disable Sharing' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
