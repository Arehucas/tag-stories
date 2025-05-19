'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelectedTemplateSection } from '@/components/SelectedTemplateSection';
import { useTemplates } from '@/hooks/useTemplates';
import { useT } from '@/lib/useT';
import { useState, useEffect } from 'react';

export default function SelectTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { templates, loading } = useTemplates();
  const initialSelected = searchParams.get('selectedTemplateId') || '';
  const campaignId = searchParams.get('campaignId') || '';
  const [selected, setSelected] = useState(initialSelected);

  // Protección: si no hay campaignId, redirige a la lista de campañas
  useEffect(() => {
    if (!campaignId) {
      router.replace('/providers/dashboard/campaigns');
    }
  }, [campaignId, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selected) {
      params.set('selectedTemplateId', selected);
    } else {
      params.delete('selectedTemplateId');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [selected]);

  const handleSelect = (templateId: string) => {
    setSelected(templateId);
  };

  const handleBack = () => {
    const url = `/providers/dashboard/campaign?campaignId=${campaignId}${selected ? `&selectedTemplateId=${selected}` : ''}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0618] via-[#18122b] to-[#1a1333] flex flex-col items-center py-12 px-4 sm:px-8 transition-colors duration-500 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 cursor-pointer" aria-label={t('not_found.back')}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-white">{t('templates.select_title')}</h1>
        </div>
        <SelectedTemplateSection
          templates={templates}
          selectedTemplateId={selected}
          overlayPreference="light-overlay"
          onSelectTemplate={handleSelect}
        />
      </div>
    </div>
  );
} 