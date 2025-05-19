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
  overlayPreference: 'dark-overlay' | 'light-overlay';
  onSelectTemplate: (templateId: string) => void;
  showRecommendationMsg?: boolean;
  showTitle?: boolean;
}

export const SelectedTemplateSection: React.FC<Props> = ({ templates, selectedTemplateId, overlayPreference, onSelectTemplate, showRecommendationMsg = true, showTitle = true }) => {
  const t = useT();
  const selected = templates.find(tpl => tpl._id === selectedTemplateId);
  const infoMsg = overlayPreference === 'dark-overlay'
    ? t('templates.recommend_dark')
    : t('templates.recommend_light');
  return (
    <section>
      {showTitle && (
        <h3 className="text-white/80 font-semibold text-base pb-[10px]">{t('templates.select_template')}</h3>
      )}
      {showRecommendationMsg && (
        <div className="flex items-start gap-2 pb-6">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="mt-0.5"><circle cx="12" cy="12" r="10" fill="#a259ff"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Arial" fontWeight="bold">i</text></svg>
          <span className="text-xs text-zinc-400 mt-0.5">{infoMsg}.</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {templates.map(tpl => (
          <div
            key={tpl._id}
            className={`rounded-xl border-4 p-2 flex flex-col items-center transition-all bg-zinc-900 w-full cursor-pointer ${tpl._id === selectedTemplateId ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-700 opacity-60'}`}
            onClick={() => onSelectTemplate(tpl._id)}
            tabIndex={0}
            role="button"
            aria-label={t('templates.aria_select').replace('{{name}}', tpl.templateName)}
          >
            <div className="w-full aspect-[9/16] flex items-center justify-center rounded-lg overflow-hidden">
              <img src={tpl.previewUrl} alt={tpl.templateName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-sm font-medium text-center text-white mt-2">{tpl.templateName}</span>
          </div>
        ))}
      </div>
    </section>
  );
}; 