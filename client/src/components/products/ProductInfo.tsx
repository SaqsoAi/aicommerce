"use client";

import {
  useAuth,
} from "@/providers/AuthProvider";

import {
  useCartStore,
} from "@/store/cart.store";

import {
  addToWishlist,
} from "@/services/wishlist.service";

type Props = {
  product: any;
};

export default function ProductInfo({
  product,
}: Props) {
  const { user } =
    useAuth();

  const { addToCart } =
    useCartStore();

  const currentPrice =
    product.discountPrice &&
    product.discountPrice <
      product.price
      ? product.discountPrice
      : product.price;

  const metaSections = [
    {
      title: "Specifications",
      rows: product.specifications,
    },
    {
      title: "Attributes",
      rows: product.attributes,
    },
  ];

  const handleWishlist =
    async () => {
      try {
        if (!user?.id) {
          alert(
            "Please login first"
          );

          return;
        }

        await addToWishlist(
          user.id,
          product.id
        );

        alert(
          "Added to wishlist"
        );
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">
        {product.name}
      </h1>

      <div className="text-zinc-500">
        SKU: {product.sku}
      </div>

      {product.brand && (
        <div>
          Brand:{" "}
          {product.brand.name}
        </div>
      )}

      {product.category && (
        <div>
          Category:{" "}
          {product.category.name}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">
          Tk {currentPrice}
        </span>

        {product.discountPrice &&
          product.discountPrice <
            product.price && (
            <span className="line-through text-zinc-400">
              Tk {product.price}
            </span>
          )}
      </div>

      {product.shortDescription && (
        <p className="text-zinc-600">
          {
            product.shortDescription
          }
        </p>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={() =>
            addToCart({
              id: product.id,
              name:
                product.name,
              price:
                currentPrice,
              image:
                product.images?.[0]
                  ?.url,
              quantity: 1,
            })
          }
          className="
          bg-black
          text-white
          px-8
          py-4
          rounded-xl
        "
        >
          Add To Cart
        </button>

        <button
          onClick={
            handleWishlist
          }
          className="
          border
          px-8
          py-4
          rounded-xl
        "
        >
          Wishlist
        </button>
      </div>

      <div className="pt-8">
        <h3 className="font-bold mb-3">
          Description
        </h3>

        <p>
          {product.description}
        </p>
      </div>

      {product.variants?.length > 0 && (
        <div className="pt-4">
          <h3 className="font-bold mb-3">
            Available Options
          </h3>

          <div className="flex flex-wrap gap-2">
            {product.variants.map(
              (variant: any) => (
                <span
                  key={variant.id}
                  className="border rounded-full px-4 py-2 text-sm"
                >
                  {variant.color} / {variant.size}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {metaSections.map(
        (section) =>
          Array.isArray(
            section.rows
          ) &&
          section.rows.length > 0 && (
            <div
              key={section.title}
              className="pt-4"
            >
              <h3 className="font-bold mb-3">
                {section.title}
              </h3>

              <div className="border rounded-xl overflow-hidden">
                {section.rows.map(
                  (
                    row: any,
                    index: number
                  ) => (
                    <div
                      key={`${row.name}-${index}`}
                      className="grid grid-cols-2 border-b last:border-b-0"
                    >
                      <div className="p-3 bg-zinc-50 font-medium">
                        {row.name}
                      </div>

                      <div className="p-3">
                        {row.value}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )
      )}
    </div>
  );
}



