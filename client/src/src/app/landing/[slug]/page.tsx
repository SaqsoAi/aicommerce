import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLandingBySlug } from "@/api/landing.api";
import LandingRenderer from "@/components/landing/LandingRenderer";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = await getPublicLandingBySlug(slug);

  if (!landing) {
    return {
      title: "Landing Page Not Found",
    };
  }

  return {
    title: landing.seoTitle || landing.title,
    description: landing.seoDescription || landing.description || landing.title,
    keywords: landing.seoKeywords || undefined,
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const landing = await getPublicLandingBySlug(slug);

  if (!landing) {
    notFound();
  }

  return <LandingRenderer landing={landing} />;
}
