import Link from 'next/link';
import { useT } from '@/lib/useT';

export default function NotFound() {
  const t = useT();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
      <h1 className="text-3xl font-bold text-white mb-4">{t('not_found.title')}</h1>
      <p className="text-white/70 mb-8">{t('not_found.description')}</p>
      <Link href="/" className="text-fuchsia-400 underline">{t('not_found.back')}</Link>
    </div>
  );
} 