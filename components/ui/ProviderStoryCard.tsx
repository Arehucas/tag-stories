import { FC } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Calendar } from 'lucide-react';
import { useRouter } from "next/navigation";

interface ProviderStoryCardProps {
  createdAt: string | Date;
  storyId: string;
}

export const ProviderStoryCard: FC<ProviderStoryCardProps> = ({ createdAt, storyId }) => {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const dateStr = format(date, "dd/MM/yyyy", { locale: es });
  const hourStr = format(date, "HH:mm", { locale: es });
  const router = useRouter();

  const handleClick = () => {
    router.push(`/providers/dashboard/campaign/story/${storyId}`);
  };

  return (
    <div
      className="flex flex-row items-center gap-0 p-6 bg-[#23243a] border border-white/15 rounded-2xl w-full min-h-[110px] shadow-sm cursor-pointer hover:bg-[#2d2e4a] transition-colors"
      style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Icono de reloj */}
      <div className="flex flex-col items-center justify-center min-w-[40px]">
        <Clock className="w-8 h-8 text-zinc-500 opacity-30" />
      </div>
      {/* Info principal */}
      <div className="flex flex-col justify-center flex-1">
        <span className="text-zinc-400 text-lg font-semibold mb-1">@UsuarioPendiente</span>
        <div className="flex items-center gap-2 text-zinc-400 text-base font-normal">
          <Calendar className="w-5 h-5 opacity-70" />
          <span>{dateStr} · {hourStr}</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderStoryCard; 