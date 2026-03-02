import { useQuery } from '@tanstack/react-query';
import { getTemplates } from '../../api/templates';
import TemplateCard from './TemplateCard';
import Spinner from '../ui/Spinner';

export default function TemplateGallery({ onUseTemplate }) {
  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  if (isLoading) return <Spinner className="mt-8" />;

  const templates = data?.templates || [];

  // Group by category
  const categories = {};
  templates.forEach((t) => {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  });

  if (templates.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 mt-8">
        No templates available
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, tmpls]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
            {category}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tmpls.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={onUseTemplate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
