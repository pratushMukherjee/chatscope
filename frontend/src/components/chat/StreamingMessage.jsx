import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '../../utils/markdown';

export default function StreamingMessage({ content }) {
  if (!content) return null;

  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
        <span className="text-white text-xs font-bold">CS</span>
      </div>

      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
            {content}
          </ReactMarkdown>
          <span className="inline-block w-2 h-4 bg-primary-500 ml-0.5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
