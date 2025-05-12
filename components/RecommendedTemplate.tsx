import React from 'react';

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
  const selected = templates.find(t => t._id === selectedTemplateId);
  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold mb-4">Plantilla recomendada</h3>
      <div className="flex gap-4 mb-4">
        {templates.map(t => (
          <div
            key={t._id}
            className={`rounded-lg border-2 p-2 flex flex-col items-center w-36 h-36 transition-all ${t._id === selectedTemplateId ? 'border-violet-600 shadow-lg scale-105' : 'border-gray-300 opacity-60'}`}
          >
            <img src={t.previewUrl} alt={t.templateName} className="w-24 h-24 object-contain mb-2" />
            <span className="text-sm font-medium text-center">{t.templateName}</span>
          </div>
        ))}
      </div>
      <div className="text-base text-gray-200 mb-1">
        En base a tu logo hemos escogido la plantilla <b>{selected?.templateName || ''}</b>.
      </div>
      <div className="text-sm text-gray-400">No es posible cambiar de plantilla por ahora.</div>
    </section>
  );
}; 