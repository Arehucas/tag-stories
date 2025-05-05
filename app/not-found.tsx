import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e]">
      <h1 className="text-3xl font-bold text-white mb-4">Página no encontrada</h1>
      <p className="text-white/70 mb-8">La página que buscas no existe.</p>
      <Link href="/" className="text-fuchsia-400 underline">Volver al inicio</Link>
    </div>
  );
} 