// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useState } from "react";
import type { ProductVariantForm } from "@/types/product";

type Props = {
  variants: ProductVariantForm[];
  setVariants: (
    variants: ProductVariantForm[]
  ) => void;
};

const availableSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

const inputClass =
  "border p-3 rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

const emptyVariant = (

): ProductVariantForm => ({
  color: "",
  size: "",  
  fabric: "",  
  occasion: "",  
  costPrice: 0,  
  salesPrice: 0,
  stock: 0,
  sku: "",
  barcode: "",
  price: 0,
  availableStock: 0,
  reservedStock: 0,
  lowStockThreshold: 5,
  supplierSku: "",
  warehouseLocation: "",
});

const slugPart = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function VariantSection({
  variants,
  setVariants,
}: Props) {
  const [
    showGenerator,
    setShowGenerator,
  ] = useState(false);
  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);
  const [colorInput, setColorInput] =
    useState("");
  const [showSizeGenerator, setShowSizeGenerator] =
    useState<number | null>(null);
  const [sizeGenSizes, setSizeGenSizes] =
    useState<string[]>([]);

  const addVariant = () => {
    setVariants([
      ...variants,
      emptyVariant(),
    ]);
  };

  const removeVariant = (
    index: number
  ) => {
    setVariants(
      variants.filter(
        (_, i) => i !== index
      )
    );
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariantForm,
    value: string
  ) => {
    const numberFields: Array<
      keyof ProductVariantForm
    > = [
      "stock",
      "price",
      "availableStock",
      "reservedStock",
      "lowStockThreshold",
    ];

    const updated = [...variants];

    updated[index] = {
      ...updated[index],
      [field]: numberFields.includes(field)
        ? Number(value)
        : value,
    };

    setVariants(updated);
  };

  const toggleSizeSelection = (
    size: string
  ) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const toggleSizeGenSelection = (
    size: string
  ) => {
    setSizeGenSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const generateSizesFromVariant = (
    variantIndex: number
  ) => {
    const baseVariant = variants[variantIndex];

    if (!baseVariant.color.trim()) {
      alert("Please fill the color field first");
      return;
    }

    if (sizeGenSizes.length === 0) {
      alert("Please select at least one size");
      return;
    }

    const existingKeys = new Set(
      variants
        .filter(
          (variant) =>
            variant.color.trim() ||
            variant.size.trim()
        )
        .map(
          (variant) =>
            `${variant.color.trim().toLowerCase()}|${variant.size.trim().toLowerCase()}`
        )
    );

    const baseSku =
      baseVariant.sku.trim() ||
      "VAR";

    const generated: ProductVariantForm[] = [];

    sizeGenSizes.forEach((size) => {
      const key =
        `${baseVariant.color.toLowerCase()}|${size.toLowerCase()}`;

      if (existingKeys.has(key)) {
        return;
      }

      generated.push({
        color: baseVariant.color,
        size,
        stock: baseVariant.stock,
        sku: "",
        barcode: "",
        price: baseVariant.price,
        availableStock: baseVariant.availableStock,
        reservedStock: baseVariant.reservedStock,
        lowStockThreshold: baseVariant.lowStockThreshold,
        supplierSku: baseVariant.supplierSku,
        warehouseLocation: baseVariant.warehouseLocation,
      });
    });

    if (generated.length === 0) {
      alert(
        "No new variants generated. All selected sizes already exist for this color."
      );
      return;
    }

    setVariants([...variants, ...generated]);
    setShowSizeGenerator(null);
    setSizeGenSizes([]);
    alert(`Generated ${generated.length} size variants`);
  };

  const generateVariants = () => {
    const baseVariant =
      variants[0] ?? emptyVariant();

    const colors = colorInput
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);

    if (
      colors.length === 0 &&
      baseVariant.color.trim()
    ) {
      colors.push(baseVariant.color.trim());
    }

    if (colors.length === 0) {
      alert(
        "Enter at least one color or fill the first variant color"
      );
      return;
    }

    if (selectedSizes.length === 0) {
      alert(
        "Please select at least one size"
      );
      return;
    }

    const existingKeys = new Set(
      variants
        .filter(
          (variant) =>
            variant.color.trim() ||
            variant.size.trim()
        )
        .map(
          (variant) =>
            `${variant.color.trim().toLowerCase()}|${variant.size.trim().toLowerCase()}`
        )
    );

    const baseSku =
      baseVariant.sku.trim() ||
      "VAR";

    const generated: ProductVariantForm[] =
      [];

    colors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const key =
          `${color.toLowerCase()}|${size.toLowerCase()}`;

        if (existingKeys.has(key)) {
          return;
        }

        generated.push({
          ...baseVariant,
          color,
          size,
          sku: `${baseSku}-${slugPart(color)}-${slugPart(size)}`,
          barcode: "",
          availableStock:
            baseVariant.availableStock ??
            baseVariant.stock ??
            0,
          reservedStock:
            baseVariant.reservedStock ?? 0,
          lowStockThreshold:
            baseVariant.lowStockThreshold ?? 5,
        });
      });
    });

    if (generated.length === 0) {
      alert(
        "No new variants generated. Existing color and size combinations were skipped."
      );
      return;
    }

    const keptVariants =
      variants.length === 1 &&
      !variants[0].color &&
      !variants[0].size &&
      !variants[0].sku
        ? []
        : variants;

    setVariants([
      ...keptVariants,
      ...generated,
    ]);
    setShowGenerator(false);
    setSelectedSizes([]);
    setColorInput("");
    alert(
      `Generated ${generated.length} variants`
    );
  };

  return (
    <div className="space-y-5">
      <div className="enterprise-responsive-guard flex flex-col gap-3 md:flex-row md:items-center md:justify-between enterprise-mobile-stack">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Product Variants
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setShowGenerator(
                !showGenerator
              )
            }
            className="rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Generate Variants
          </button>

          <button
            type="button"
            onClick={addVariant}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Variant
          </button>
        </div>
      </div>

      {showGenerator && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900 transition-colors duration-200 motion-reduce:transition-none">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Variant Auto Generator
          </h3>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter colors separated by comma, select sizes, and the generator will create missing color and size combinations. Existing variants are kept and duplicates are skipped.
          </p>

          <input
            value={colorInput}
            onChange={(event) =>
              setColorInput(
                event.target.value
              )
            }
            placeholder="Colors: Black, White, Navy"
            className={`${inputClass} w-full`}
          />

          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  toggleSizeSelection(size)
                }
                className={`rounded-lg border-2 px-4 py-2 transition ${
                  selectedSizes.includes(size)
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateVariants}
              className="rounded-xl bg-green-600 px-5 py-2 text-white hover:bg-green-700"
            >
              Generate
            </button>

            <button
              type="button"
              onClick={() => {
                setShowGenerator(false);
                setSelectedSizes([]);
                setColorInput("");
              }}
              className="rounded-xl bg-zinc-200 px-5 py-2 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.map(
        (variant, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 transition-colors duration-200 motion-reduce:transition-none"
          >
            <div className="flex items-center justify-between enterprise-mobile-stack">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Variant #{index + 1}
              </h3>

              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeVariant(index)
                  }
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  Remove Variant
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3 enterprise-mobile-stack">
              <input
                placeholder="Color"
                value={variant.color}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "color",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                placeholder="Size"
                value={variant.size}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "size",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Stock"
                value={variant.stock}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "stock",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3 enterprise-mobile-stack">
              <input
                placeholder="Variant SKU"
                value={variant.sku}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "sku",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                placeholder="Variant Barcode"
                value={variant.barcode}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "barcode",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Price Override"
                value={variant.price}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "price",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3 enterprise-mobile-stack">
              <input
                type="number"
                placeholder="Available Stock"
                value={
                  variant.availableStock ?? 0
                }
                onChange={(event) =>
                  updateVariant(
                    index,
                    "availableStock",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Reserved Stock"
                value={
                  variant.reservedStock ?? 0
                }
                onChange={(event) =>
                  updateVariant(
                    index,
                    "reservedStock",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                type="number"
                placeholder="Low Stock Threshold"
                value={
                  variant.lowStockThreshold ??
                  5
                }
                onChange={(event) =>
                  updateVariant(
                    index,
                    "lowStockThreshold",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 enterprise-mobile-stack">
              <input
                placeholder="Supplier SKU"
                value={
                  variant.supplierSku ?? ""
                }
                onChange={(event) =>
                  updateVariant(
                    index,
                    "supplierSku",
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <input
                placeholder="Warehouse Location"
                value={
                  variant.warehouseLocation ??
                  ""
                }
                onChange={(event) =>
                  updateVariant(
                    index,
                    "warehouseLocation",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            {/* Generate Sizes Button and Panel */}
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <button
                type="button"
                onClick={() =>
                  setShowSizeGenerator(
                    showSizeGenerator === index
                      ? null
                      : index
                  )
                }
                className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {showSizeGenerator === index
                  ? "Cancel Size Generator"
                  : "Generate Sizes"}
              </button>

              {showSizeGenerator === index && (
                <div className="mt-4 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950 transition-colors duration-200 motion-reduce:transition-none">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Generate size variants for: {variant.color || "this color"}
                  </p>

                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Select sizes to generate. Stock, price, and warehouse settings will be copied from this variant.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          toggleSizeGenSelection(size)
                        }
                        className={`rounded-lg border-2 px-3 py-1 text-sm transition ${
                          sizeGenSizes.includes(size)
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      generateSizesFromVariant(index)
                    }
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                  >
                    Generate Selected Sizes
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}


