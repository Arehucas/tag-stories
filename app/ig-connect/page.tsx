"use client";
import { Instagram } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function IGConnectPage() {
  const t = useTranslations('igValidation');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100">
        <div className="bg-gradient-to-tr from-fuchsia-500 to-blue-500 rounded-full p-4 mb-2">
          <Instagram size={48} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">{t('sectionTitle')}</h1>
        <p className="text-gray-700 text-center mb-2">{t('sectionDescription')}</p>
        <div className="w-full bg-gray-50 rounded-lg p-4 mb-2">
          <div className="font-semibold text-gray-800 mb-1">{t('requirementsTitle')}</div>
          <ul className="list-disc pl-5 text-gray-600 text-sm">
            {(Array.isArray(t.raw('requirementsList')) ? t.raw('requirementsList') : [t('requirementsList')]).map((req: string, i: number) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white font-semibold py-3 rounded-xl text-lg shadow-lg hover:scale-105 transition-transform"
          onClick={() => {
            signIn('instagram');
          }}
        >
          <Instagram size={22} />
          {t('connectButton')}
        </button>
        <Link href="/providers/dashboard" className="text-blue-500 text-sm mt-2 hover:underline">Volver al dashboard</Link>
      </div>
    </div>
  );
} 