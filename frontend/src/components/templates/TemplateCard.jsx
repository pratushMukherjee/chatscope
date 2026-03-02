export default function TemplateCard({ template, onUse }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
          {template.title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0 capitalize">
          {template.category}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
        {template.description}
      </p>
      <button
        onClick={() => onUse(template)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Use template
      </button>
    </div>
  );
}
