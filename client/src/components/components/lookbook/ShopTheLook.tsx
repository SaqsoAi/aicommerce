import Link from "next/link";

type Product = {
  id: string;
  name?: string;
  title?: string;
  price?: number;
  thumbnail?: string;
  image?: string;
};

export default function ShopTheLook({ products }: { products: { product: Product }[] }) {
  if (!products?.length) return null;

  return (
    <div className="mt-8 rounded-[2rem] bg-neutral-50 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Shop The Look</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {products.map(({ product }) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex gap-4 rounded-2xl bg-white p-3 transition hover:shadow"
          >
            <div
              className="h-24 w-20 rounded-xl bg-neutral-100 bg-cover bg-center"
              style={{
                backgroundImage: product.thumbnail || product.image ? `url(${product.thumbnail || product.image})` : undefined,
              }}
            />
            <div>
              <h3 className="font-medium">{product.name || product.title || "Product"}</h3>
              {product.price !== undefined && <p className="mt-1 text-sm text-neutral-500">? {product.price}</p>}
              <p className="mt-3 text-xs uppercase tracking-wider">View Product</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
