import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductById } from "@/api/product.api";
import ProductGallery from "@/components/products/ProductGallery";
import ProductVariantSelector from "@/components/products/ProductVariantSelector";
import ProductSpecifications from "@/components/products/ProductSpecifications";
import ProductAttributes from "@/components/products/ProductAttributes";
import RelatedProducts from "@/components/products/RelatedProducts";
import RecentlyViewed from "../RecentlyViewed";
import RecommendedProducts from "../RecommendedProducts";
import SizePredictor from "@/components/ai/SizePredictor";
import ReviewSummary from "@/components/ai/ReviewSummary";
import TryOnButton from "@/components/ai/TryOnButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await getProductById(id);
    const product = response.data;

    return {
      title: product?.seoTitle || product?.name || "Product",
      description:
        product?.seoDescription ||
        product?.shortDescription ||
        product?.description ||
        "Product details",
      keywords: product?.seoKeywords || undefined,
    };
  } catch {
    return {
      title: "Product",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const response = await getProductById(id);
  const product = response.data;

  if (!product) {
    notFound();
  }

  const images =
    product.images?.length > 0 ? product.images : product.gallery || [];

  const price = product.discountPrice || product.price;

  return (
    <main className="min-h-screen pt-24 lg:pt-28 bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery
          thumbnail={product.thumbnail}
          images={images}
          gallery={product.gallery || []}
          alt={product.name}
        />

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              {product.category?.name || "Product"}
              {product.subcategory?.name
                ? ` / ${product.subcategory.name}`
                : ""}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-zinc-500">
              {product.brand?.name
                ? `Brand: ${product.brand.name}`
                : "AI Commerce Product"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-black">Tk {price}</span>

              {product.discountPrice && (
                <span className="text-lg text-zinc-400 line-through">
                  Tk {product.price}
                </span>
              )}

              {product.status && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  {product.status}
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-zinc-500">SKU</p>
                <p className="font-semibold">{product.sku || "-"}</p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-zinc-500">Style No</p>
                <p className="font-semibold">{product.styleNo || "-"}</p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-zinc-500">Barcode</p>
                <p className="font-semibold">{product.barcode || "-"}</p>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <p className="text-zinc-500">Condition</p>
                <p className="font-semibold">{product.condition || "NEW"}</p>
              </div>
            </div>
          </div>

          <ProductVariantSelector
            productId={product.id}
            productName={product.name}
            productImage={product.thumbnail}
            variants={product.variants || []}
            basePrice={product.discountPrice || product.price}
          />

          <TryOnButton productId={product.id} />

          <SizePredictor />

          <ReviewSummary productId={product.id} />

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-2xl font-bold">Description</h2>

            {product.shortDescription && (
              <p className="mb-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                {product.shortDescription}
              </p>
            )}

            <p className="whitespace-pre-line text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-2">
        <ProductSpecifications specifications={product.specifications || []} />

        <ProductAttributes attributes={product.attributes || []} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <RelatedProducts
          currentProductId={product.id}
          categoryId={product.categoryId}
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <RecommendedProducts />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <RecentlyViewed />
      </section>
    </main>
  );
}








