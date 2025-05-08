'use client';
import LoaderBolas from "@/components/ui/LoaderBolas";
import LoaderTable from "@/components/ui/LoaderTable";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] gap-16">
      <div className="flex flex-col items-center">
        <LoaderBolas text="Cargando... (demo infinito)" />
        <span className="text-white mt-2">Loader global (fantasma)</span>
      </div>
      <div className="flex flex-col items-center">
        <LoaderTable />
        <span className="text-white mt-2">Loader local (tablas, cards, etc)</span>
      </div>
    </div>
  );
} 