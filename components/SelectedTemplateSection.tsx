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
  overlayPreference: 'dark-overlay' | 'light-overlay';
  onSelectTemplate: (templateId: string) => void;
}

export const SelectedTemplateSection: React.FC<Props> = ({ templates, selectedTemplateId, overlayPreference, onSelectTemplate }) => {
  const selected = templates.find(t => t._id === selectedTemplateId);
  const infoMsg = overlayPreference === 'dark-overlay'
    ? 'En base a tu logo actual, te recomendaríamos una plantilla oscura'
    : 'En base a tu logo actual, te recomendaríamos una plantilla clara';
  return (
    <section className="mt-8">
      <h3 className="text-white/80 font-semibold text-base pb-[10px]">Selecciona tu plantilla</h3>
      <div className="flex items-start gap-2 mb-4">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="mt-0.5"><circle cx="12" cy="12" r="10" fill="#a259ff"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Arial" fontWeight="bold">i</text></svg>
        <span className="text-xs text-zinc-400 mt-0.5">{infoMsg}.</span>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        {templates.map(t => (
          <div
            key={t._id}
            className={`rounded-xl border-4 p-2 flex flex-col items-center transition-all bg-zinc-900 w-full cursor-pointer ${t._id === selectedTemplateId ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-700 opacity-60'}`}
            onClick={() => onSelectTemplate(t._id)}
            tabIndex={0}
            role="button"
            aria-label={`Seleccionar plantilla ${t.templateName}`}
          >
            <div className="w-full aspect-[9/16] flex items-center justify-center rounded-lg overflow-hidden">
              <img src={t.previewUrl} alt={t.templateName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-sm font-medium text-center text-white mt-2">{t.templateName}</span>
          </div>
        ))}
      </div>
    </section>
  );
}; 