import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateGallery from '../components/templates/TemplateGallery';
import TemplateEditor from '../components/templates/TemplateEditor';
import Button from '../components/ui/Button';

export default function TemplatesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  const handleUseTemplate = (template) => {
    // Navigate to chat with template pre-filled via state
    navigate('/', { state: { templatePrompt: template.template } });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Prompt Templates
        </h1>
        <Button onClick={() => setShowEditor(true)}>
          + Create Template
        </Button>
      </div>
      <TemplateGallery onUseTemplate={handleUseTemplate} />
      {showEditor && <TemplateEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
}
