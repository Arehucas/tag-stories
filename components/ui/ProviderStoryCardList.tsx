import { FC } from "react";
import ProviderDashboardStoryCard from "./ProviderDashboardStoryCard";
import { useT } from '@/lib/useT';

interface Story {
  createdAt: string | Date;
  status: "pending" | "validated" | "redeemed" | "rejected";
  id: string;
  _id?: string;
  campaignNombre?: string;
  campaignId?: string;
}

interface ProviderStoryCardListProps {
  stories: Story[];
  campaignNames?: Record<string, string>;
}

const ProviderStoryCardList: FC<ProviderStoryCardListProps> = ({ stories, campaignNames = {} }) => {
  const t = useT();

  if (!stories.length) {
    return <div className="text-center text-zinc-500 py-8">{t("providerStories.noStories")}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {stories.map((story, idx) => (
        <ProviderDashboardStoryCard
          key={idx}
          story={story}
          campaignName={story.campaignNombre || campaignNames[String(story.campaignId)] || t('providerStories.noCampaign')}
          onClick={() => window.location.assign(`/providers/dashboard/campaign/story/${story._id || story.id}`)}
          origin="stories"
        />
      ))}
    </div>
  );
};

export default ProviderStoryCardList; 