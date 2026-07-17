import { getLookbookBySlug } from "@/api/lookbooks.api";
import LookbookDetail from "@/components/lookbook/LookbookDetail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LookbookDetailPage({ params }: Props) {
  const { slug } = await params;

  const lookbook = await getLookbookBySlug(slug);

  if (!lookbook) {
    return notFound();
  }

  return <LookbookDetail lookbook={lookbook} />;
}
