import BrandStateScreen from "@/components/brand/BrandStateScreen";

export default function NotFound() {
  return (
    <BrandStateScreen
      title="Page not found"
      subtitle="The page you are looking for is not available."
      ctaLabel="Continue Shopping"
      ctaHref="/shop"
    />
  );
}