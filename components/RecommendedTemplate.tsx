import React from 'react';
import { useT } from '@/lib/useT';

interface Template {
  _id: string;
  templateName: string;
  previewUrl?: string;
  type: string;
}

interface Props {
  templates: Template[];
  selectedTemplateId: string;
}

export const RecommendedTemplate: React.FC<Props> = ({ templates, selectedTemplateId }) => {
  const t = useT();
  const selected = templates.find(tpl => tpl._id === selectedTemplateId);
  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold mb-4">{t('templates.recommended')}</h3>
      <div className="flex gap-4 mb-4">
        {templates.map(tpl => (
          <div
            key={tpl._id}
            className={`rounded-lg border-2 p-2 flex flex-col items-center w-36 h-36 transition-all cursor-pointer ${tpl._id === selectedTemplateId ? 'border-violet-600 shadow-lg scale-105' : 'border-gray-300 opacity-60'}`}
          >
            <img src={tpl.previewUrl} alt={tpl.templateName} className="w-24 h-24 object-contain mb-2" />
            <span className="text-sm font-medium text-center">{tpl.templateName}</span>
          </div>
        ))}
      </div>
      <div className="text-base text-gray-200 mb-1">
        {t('templates.recommended_based_on_logo').replace('{{name}}', selected?.templateName || '')}
      </div>
      <div className="text-sm text-gray-400">{t('templates.cannot_change')}</div>
    </section>
  );
}; 