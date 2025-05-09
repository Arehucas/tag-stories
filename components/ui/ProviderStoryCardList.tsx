import { FC } from "react";
import ProviderStoryCard from "./ProviderStoryCard";
import { useT } from '@/lib/useT';

interface Story {
  createdAt: string | Date;
  status: "pending" | "validated" | "redeemed";
}

interface ProviderStoryCardListProps {
  stories: Story[];
}

const ProviderStoryCardList: FC<ProviderStoryCardListProps> = ({ stories }) => {
  const t = useT();

  if (!stories.length) {
    return <div className="text-center text-zinc-500 py-8">{t("providerStories.noStories")}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {stories.map((story, idx) => (
        <ProviderStoryCard key={idx} createdAt={story.createdAt} />
      ))}
    </div>
  );
};

export default ProviderStoryCardList; 