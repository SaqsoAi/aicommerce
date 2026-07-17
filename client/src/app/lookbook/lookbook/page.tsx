import { getPublishedLookbooks } from "@/api/lookbooks.api";
import LookbookGrid from "@/components/lookbook/LookbookGrid";
import LookbookHero from "@/components/lookbook/LookbookHero";

export const dynamic = "force-dynamic";

export default async function LookbookPage() {
  const lookbooks = await getPublishedLookbooks();

  return (
    <main className="bg-neutral-100">
      <LookbookHero />
      <LookbookGrid lookbooks={lookbooks} />
    </main>
  );
}
