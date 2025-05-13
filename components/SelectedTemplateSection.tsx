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

export const SelectedTemplateSection: React.FC<Props> = ({ templates, selectedTemplateId }) => {
  const selected = templates.find(t => t._id === selectedTemplateId);
  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold mb-4">Plantilla recomendada</h3>
      <div className="grid grid-cols-2 gap-6 mb-4">
        {templates.map(t => (
          <div
            key={t._id}
            className={`rounded-xl border-4 p-2 flex flex-col items-center transition-all bg-zinc-900 w-full ${t._id === selectedTemplateId ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-700 opacity-60'}`}
          >
            <div className="w-full aspect-[9/16] flex items-center justify-center rounded-lg overflow-hidden">
              <img src={t.previewUrl} alt={t.templateName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-sm font-medium text-center text-white mt-2">{t.templateName}</span>
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