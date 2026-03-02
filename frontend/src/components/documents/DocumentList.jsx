import { useDocumentList, useDeleteDocument } from '../../hooks/useDocuments';
import Spinner from '../ui/Spinner';

const statusBadge = {
  uploading: { text: 'Uploading', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ready: { text: 'Ready', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  error: { text: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList() {
  const { data, isLoading } = useDocumentList();
  const deleteMutation = useDeleteDocument();

  if (isLoading) return <Spinner className="mt-8" />;

  if (!data?.documents?.length) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 mt-8">
        No documents uploaded yet
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.documents.map((doc) => {
        const badge = statusBadge[doc.status] || statusBadge.error;
        return (
          <div
            key={doc.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {doc.filename}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatFileSize(doc.file_size)}
                  {doc.chunk_count != null && ` \u00B7 ${doc.chunk_count} chunks`}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${badge.color}`}>
                {badge.text}
              </span>
            </div>

            {doc.error_message && (
              <p className="text-xs text-red-500 mt-2 truncate">{doc.error_message}</p>
            )}

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => deleteMutation.mutate(doc.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
