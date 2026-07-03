import { SaqsoCard } from "@/components/saqso";

export default function PersonalizedRecommendations() {
  return (
    <SaqsoCard>
      <h2 className="mb-5 text-2xl font-black text-zinc-950 dark:text-white">
        Personalized Recommendations
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">Recommended For You</div>
        <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">Recently Viewed</div>
        <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900">Trending Now</div>
      </div>
    </SaqsoCard>
  );
}


