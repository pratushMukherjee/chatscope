import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createTemplate } from '../../api/templates';
import Button from '../ui/Button';
import Input from '../ui/Input';

const categories = ['coding', 'writing', 'analysis', 'research', 'learning'];

export default function TemplateEditor({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    template: '',
    category: 'coding',
  });

  const mutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create template'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.template) return;
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Template
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Code Reviewer"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this template do?"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template (use {"{{variable}}"} for placeholders)
            </label>
            <textarea
              value={form.template}
              onChange={(e) => setForm({ ...form, template: e.target.value })}
              placeholder="Write your prompt template here..."
              rows={5}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
