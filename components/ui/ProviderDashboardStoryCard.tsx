import { FC } from "react";
import { CheckCircle, Clock, ChevronRight, X } from "lucide-react";

interface ProviderDashboardStoryCardProps {
  story: any;
  campaignName?: string;
  onClick: () => void;
  origin?: 'dashboard' | 'stories';
}

const getIcon = (status: string) => {
  switch (status) {
    case "validated":
      return <CheckCircle className="w-7 h-7 text-white" />;
    case "redeemed":
      return <CheckCircle className="w-7 h-7 text-white" />;
    case "rejected":
      return <X className="w-7 h-7 text-white" />;
    case "pending":
    default:
      return <Clock className="w-6 h-6 text-violet-300" />;
  }
};

const getCircleColor = (status: string) => {
  switch (status) {
    case "validated":
      return "bg-blue-600";
    case "redeemed":
      return "bg-green-600";
    case "rejected":
      return "bg-red-700";
    case "pending":
    default:
      return "bg-violet-900";
  }
};

const getChevronColor = (status: string) => {
  switch (status) {
    case "validated":
      return "#2563eb"; // azul
    case "redeemed":
      return "#22c55e"; // verde
    case "rejected":
      return "#e11d48"; // rojo
    case "pending":
    default:
      return "#a259ff"; // violeta
  }
};

const ProviderDashboardStoryCard: FC<ProviderDashboardStoryCardProps> = ({ story, campaignName, onClick, origin }) => {
  const date = new Date(story.createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  const handleClick = () => {
    if (origin && typeof window !== 'undefined') {
      sessionStorage.setItem('storyBackOrigin', origin);
    }
    onClick();
  };

  return (
    <div
      className="bg-gradient-to-br from-[#18122b] to-[#0a0618] rounded-xl p-5 flex items-center gap-4 border border-violet-950/60 cursor-pointer hover:bg-blue-950/30 transition-colors"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow ${getCircleColor(story.status)}`}>
        {getIcon(story.status)}
      </div>
      <div className="flex-1">
        <div className="text-white font-semibold flex items-center gap-2">
          {`${day}/${month}/${year}`}
          <span className="font-normal text-white/50">· {hour}:{min}h</span>
        </div>
        <div className="text-xs text-gray-400">
          {campaignName || "-"}
        </div>
      </div>
      <ChevronRight className="w-6 h-6" style={{ color: getChevronColor(story.status) }} />
    </div>
  );
};

export default ProviderDashboardStoryCard; 