import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  if (match) {
    return (
      <div className="relative group my-3">
        <div className="flex items-center justify-between bg-gray-800 text-gray-300 text-xs px-4 py-2 rounded-t-lg">
          <span>{match[1]}</span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            fontSize: '0.85rem',
          }}
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
}
