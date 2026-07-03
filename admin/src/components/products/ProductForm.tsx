"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import ImageUpload, { type GalleryItem } from "./ImageUpload";

import VariantSection from "./VariantSection";

import {
  createProduct,
  getProductById,
  updateProduct,
} from "@/services/product.service";
import { getBrands } from "@/services/brand.service";
import {
  getSubcategories,
  getSubcategoriesByCategory,
} from "@/services/subcategory.service";

import { generateSKU } from "@/lib/generateSku";

import type { Category } from "@/types/category";

import type {
  ProductFormData,
  ProductMetaRow,
  ProductVariantForm,
} from "@/types/product";

import { generateProductCodes } from "@/services/product-master.service";

import { generateAIContent } from "@/services/ai-content.service";
import { getNextProductSerials } from "@/services/product-serial.service";

import {
  autoFillBarcode,
  autoFillStyle,
} from "@/services/integration-engine.service";

type Props = {
  onSuccess?: () => void;

  productId?: string;
};

type Brand = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
};

type CategoryResponse = {
  success: boolean;
  data: Category[];
};

export default function ProductForm({ onSuccess, productId }: Props) {
  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  const { register, handleSubmit, reset, setValue, getValues, watch } =
    useForm<ProductFormData>();

  const seoTitle = watch("seoTitle");
  const seoDescription = watch("seoDescription");
  const selectedCategoryId = watch("categoryId");
  const draftKey = productId
    ? `ai-commerce-product-draft-edit-${productId}`
    : "ai-commerce-product-draft-new";

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [variants, setVariants] = useState<ProductVariantForm[]>([
    {
      color: "",
      size: "",
      stock: 0,
      sku: "",
      barcode: "",
      price: 0,
      availableStock: 0,
      reservedStock: 0,
      lowStockThreshold: 5,
      supplierSku: "",
      warehouseLocation: "",
    },
  ]);

  const [specifications, setSpecifications] = useState<ProductMetaRow[]>([
    {
      name: "",
      value: "",
    },
  ]);

  const [attributes, setAttributes] = useState<ProductMetaRow[]>([
    {
      name: "",
      value: "",
    },
  ]);

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload/product`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errorText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Upload failed")) {
        throw error;
      }
      throw new Error(
        `Image upload failed: ${error instanceof Error ? error.message : "Network error"}`,
      );
    }
  };

  const [video, setVideo] = useState<File | null>(null);

  const [lookupBarcode, setLookupBarcode] = useState("");
  const [serialInfo, setSerialInfo] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        const result = await getProductById(productId);

        const product = result.data;

        setValue("name", product.name);

        setValue("sku", product.sku);

        setValue("styleNo", product.styleNo);

        setValue("barcode", product.barcode);

        setValue("description", product.description);

        setValue("shortDescription", product.shortDescription);

        setValue("price", product.price);

        setValue("discountPrice", product.discountPrice);

        setValue("categoryId", product.categoryId);

        setValue("subcategoryId", product.subcategoryId);

        setValue("brandId", product.brandId);

        setValue("featured", product.featured);

        setValue("trending", product.trending);

        setValue("status", product.status);

        setValue("visibility", product.visibility);

        setValue("approvalStatus" as any, product.approvalStatus ?? "APPROVED");
        setValue("approvalNote" as any, product.approvalNote ?? "");
        setValue("publishAt" as any, product.publishAt ? String(product.publishAt).slice(0, 16) : "");
        setValue("unpublishAt" as any, product.unpublishAt ? String(product.unpublishAt).slice(0, 16) : "");

        setValue("condition", product.condition ?? "NEW");

        setValue("seoTitle", product.seoTitle ?? "");

        setValue("seoKeywords", product.seoKeywords ?? "");

        setValue("seoDescription", product.seoDescription ?? "");

        const normalizeExistingProductImages4107 = [
          product.thumbnail,
          ...(Array.isArray(product.images)
            ? product.images.map((item: any) => item.url)
            : []),
          ...(Array.isArray(product.gallery)
            ? product.gallery.map((item: any) => item.url)
            : []),
        ].filter(Boolean);

        setExistingImages(Array.from(new Set(normalizeExistingProductImages4107)));

        interface ProductVariant {
          color?: string | null;
          size?: string | null;
          stock?: number | string | null;
          sku?: string | null;
          barcode?: string | null;
          price?: number | string | null;
          availableStock?: number | string | null;
          reservedStock?: number | string | null;
          lowStockThreshold?: number | string | null;
          supplierSku?: string | null;
          warehouseLocation?: string | null;
        }

        interface FormattedVariant {
          color: string;
          size: string;
          stock: number;
          sku: string;
          barcode: string;
          price: number;
          availableStock: number;
          reservedStock: number;
          lowStockThreshold: number;
          supplierSku: string;
          warehouseLocation: string;
        }

        if (Array.isArray(product?.variants) && product.variants.length > 0) {
          setVariants(
            product.variants.map(
              (variant: ProductVariant): FormattedVariant => {
                const {
                  color,
                  size,
                  stock,
                  sku,
                  barcode,
                  price,
                  availableStock,
                  reservedStock,
                  lowStockThreshold,
                  supplierSku,
                  warehouseLocation,
                } = variant;

                const fallbackStock = stock ?? 0;

                return {
                  color: color ?? "",
                  size: size ?? "",
                  stock: Number(fallbackStock),
                  sku: sku ?? "",
                  barcode: barcode ?? "",
                  price: Number(price),
                  availableStock: Number(availableStock ?? fallbackStock),
                  reservedStock: Number(reservedStock),
                  lowStockThreshold: Number(lowStockThreshold ?? 5),
                  supplierSku: supplierSku ?? "",
                  warehouseLocation: warehouseLocation ?? "",
                };
              },
            ),
          );
        }

        if (
          Array.isArray(product.specifications) &&
          product.specifications.length > 0
        ) {
          setSpecifications(product.specifications);
        }

        if (
          Array.isArray(product.attributes) &&
          product.attributes.length > 0
        ) {
          setAttributes(product.attributes);
        }
      } catch (error) {
        console.error(error);
        alert(
          `Failed to load product for editing: ${error instanceof Error ? error.message : "Network error"}`,
        );
      }
    };

    void loadProduct();
  }, [productId, setValue]);

  const [lookupStyleCode, setLookupStyleCode] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const inputClass =
    "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 p-3 rounded-xl";

  const panelClass =
    "border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100";

  // ================= PRODUCT FORM DRAFT RESTORE =================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(draftKey);
    if (!saved) return;

    try {
      const draft = JSON.parse(saved);
      const savedAt = draft?.savedAt
        ? new Date(draft.savedAt).toLocaleString()
        : "previous session";

      const ok = confirm(
        `Previous product draft found.\n\nSaved: ${savedAt}\n\nDo you want to restore previous session?`
      );

      if (!ok) {
        localStorage.removeItem(draftKey);
        return;
      }

      if (draft.form) {
        Object.entries(draft.form).forEach(([key, value]) => {
          setValue(key as keyof ProductFormData, value as any);
        });
      }

      if (Array.isArray(draft.variants)) {
        setVariants(draft.variants);
      }

      if (Array.isArray(draft.specifications)) {
        setSpecifications(draft.specifications);
      }

      if (Array.isArray(draft.attributes)) {
        setAttributes(draft.attributes);
      }

      if (Array.isArray(draft.existingImages)) {
        setExistingImages(draft.existingImages);
      }

      alert("Product draft restored");
    } catch (error) {
      console.error("Draft restore failed", error);
    }
  }, [draftKey, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      try {
        const form = getValues();

        const hasDraft =
          Object.values(form || {}).some((value) => {
            if (typeof value === "string") return value.trim().length > 0;
            return value !== undefined && value !== null && value !== false;
          }) ||
          variants.some((item) => item.color || item.size || item.sku || item.barcode) ||
          existingImages.length > 0 ||
          specifications.some((item) => item.name || item.value) ||
          attributes.some((item) => item.name || item.value);

        if (!hasDraft) return;

        localStorage.setItem(
          draftKey,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            form,
            variants,
            specifications,
            attributes,
            existingImages,
          })
        );
      } catch (error) {
        console.error("Draft save failed", error);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [
    draftKey,
    watch(),
    variants,
    specifications,
    attributes,
    existingImages,
    getValues,
  ]);
  // ================= LOAD INITIAL DATA =================

  useEffect(() => {
    const initialize = async () => {
      try {
        const categoryRes = await fetch(`${API}/categories`);

        const categoryData: CategoryResponse = await categoryRes.json();

        setCategories(categoryData.data || []);

        const brandRes = await getBrands();

        setBrands(brandRes || []);

        const subcategoryRes = await getSubcategories();

        setSubcategories(subcategoryRes.data || []);

        if (!productId) {
          setValue("sku", generateSKU("PRODUCT"));
      await loadProductSerials();
        }
      } catch (error) {
        console.error(error);
      }
    };

    void initialize();
  }, [API, productId, setValue]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      return;
    }

    fetch(`${API}/categories/subcategories/category/${selectedCategoryId}`)
      .then((res) => res.json())
      .then((data) => {
        setSubcategories(data.data || []);
      });
  }, [selectedCategoryId]);

  const handleFetchProduct = async () => {
    try {
      let response;

      if (lookupBarcode.trim()) {
        response = await autoFillBarcode(lookupBarcode);
      } else if (lookupStyleCode.trim()) {
        response = await autoFillStyle(lookupStyleCode);
      } else {
        alert("Enter Barcode or Style Code");
        return;
      }

      const product = response?.data;

      if (!product) {
        alert("Product not found");
        return;
      }

      setValue("name", product.name ?? "");

      setValue("barcode", product.barcode ?? "");

      setValue("styleNo", product.styleNo ?? "");

      setValue("price", Number(product.price ?? 0));

      setValue("description", product.description ?? "");

      setValue("shortDescription", product.shortDescription ?? "");

      setValue("categoryId", product.categoryId ?? "");

      setValue("subcategoryId", product.subcategoryId ?? "");

      setValue("brandId", product.brandId ?? "");

      setValue("featured", Boolean(product.featured));

      setValue("trending", Boolean(product.trending));

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        setVariants(
          product.variants.map((variant: any) => ({
            color: variant.color ?? "",

            size: variant.size ?? "",

            stock: Number(variant.stock ?? 0),

            sku: variant.sku ?? "",

            barcode: variant.barcode ?? "",

            price: Number(variant.price ?? 0),
            availableStock: Number(
              variant.availableStock ?? variant.stock ?? 0,
            ),
            reservedStock: Number(variant.reservedStock ?? 0),
            lowStockThreshold: Number(variant.lowStockThreshold ?? 5),
            supplierSku: variant.supplierSku ?? "",
            warehouseLocation: variant.warehouseLocation ?? "",
          })),
        );
      }

      alert("Product Auto Filled");
    } catch (error) {
      console.error(error);

      alert("Auto Fill Failed");
    }
  };

  function parseSerialCode(value: string) {
    const match = String(value || "").match(/^([A-Za-z]+)(\d+)$/);
    return {
      prefix: match?.[1] || "A",
      number: match?.[2] ? Number(match[2]) : 1,
      width: match?.[2]?.length || 5,
    };
  }

  function formatSerialCode(prefix: string, value: number, width: number) {
    return `${prefix}${String(value).padStart(width, "0")}`;
  }

  function applyVariantBarcodes(startBarcode?: string) {
    const start = parseSerialCode(startBarcode || serialInfo?.nextBarcode || "A00001");

    setVariants((prev) =>
      prev.map((variant, index) => ({
        ...variant,
        barcode:
          variant.barcode && variant.barcode !== "AUTO CREATE"
            ? variant.barcode
            : formatSerialCode(start.prefix, start.number + index, start.width),
      }))
    );
  }

  const loadProductSerials = async () => {
    try {
      const result = await getNextProductSerials();
      setSerialInfo(result);

      if (!productId) {
        const currentStyle = getValues("styleNo");
        const currentBarcode = getValues("barcode");

        if (!currentStyle || currentStyle === "AUTO CREATE") {
          setValue("styleNo", result.nextStyleNo);
        }

        if (!currentBarcode || currentBarcode === "AUTO CREATE") {
          setValue("barcode", result.nextBarcode);
        }

        applyVariantBarcodes(result.nextBarcode);
      }
    } catch (error) {
      console.error("Serial load failed", error);
    }
  };

  useEffect(() => {
    loadProductSerials();
  }, []);

  useEffect(() => {
    if (!productId && serialInfo?.nextBarcode) {
      applyVariantBarcodes(serialInfo.nextBarcode);
    }
  }, [variants.length, serialInfo?.nextBarcode]);

  const handleGenerateCodes = async () => {
    await loadProductSerials();
    alert("Next Style and Barcode generated");
  };

  const filterMetaRows = (rows: ProductMetaRow[]) =>
    rows.filter((row) => row.name.trim() && row.value.trim());

  const updateMetaRow = (
    rows: ProductMetaRow[],
    setRows: (rows: ProductMetaRow[]) => void,
    index: number,
    field: keyof ProductMetaRow,
    value: string,
  ) => {
    const updated = [...rows];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setRows(updated);
  };

  const addMetaRow = (
    rows: ProductMetaRow[],
    setRows: (rows: ProductMetaRow[]) => void,
  ) => {
    setRows([
      ...rows,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const removeMetaRow = (
    rows: ProductMetaRow[],
    setRows: (rows: ProductMetaRow[]) => void,
    index: number,
  ) => {
    setRows(
      rows.length === 1
        ? [
            {
              name: "",
              value: "",
            },
          ]
        : rows.filter((_, i) => i !== index),
    );
  };

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true);

      const productName = getValues("name");

      if (!productName) {
        alert("Enter Product Name First");
        return;
      }

      const result = await generateAIContent(productName);

      const content = JSON.stringify(result);
      const parsed =
        typeof content === "string" ? JSON.parse(content) : content;

      setValue("shortDescription", parsed.shortDescription || "");

      setValue("description", parsed.description || "");

      setValue("seoTitle", parsed.seoTitle || "");

      setValue("seoKeywords", parsed.seoKeywords || "");

      setValue("seoDescription", parsed.seoDescription || "");

      alert("AI Content Generated");
    } catch (error) {
      console.error(error);

      alert("AI Generation Failed");
    } finally {
      setAiLoading(false);
    }
  };

  // ================= SUBMIT =================

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const result = await uploadImage(image.file);

          return {
            url: result.url,
            isThumbnail: image.isThumbnail,
          };
        }),
      );

      const startSerial = parseSerialCode(serialInfo?.nextBarcode || getValues("barcode") || "A00001");
      const finalVariantsForSerial = variants.map((variant, index) => ({
        ...variant,
        barcode:
          variant.barcode && variant.barcode !== "AUTO CREATE"
            ? variant.barcode
            : formatSerialCode(startSerial.prefix, startSerial.number + index, startSerial.width),
      }));

      const payload = {
        ...data,

        costPrice: (data as any).costPrice ? Number((data as any).costPrice) : undefined,

        price: Number(data.price),

        discountPrice: data.discountPrice
          ? Number(data.discountPrice)
          : undefined,

        variants: finalVariantsForSerial,

        specifications: filterMetaRows(specifications),

        attributes: filterMetaRows(attributes),

        gallery: [
          ...existingImages.map((url) => ({
            url,
            isThumbnail: false,
          })),
          ...uploadedImages,
        ],

        videoUrl: video?.name,

        approvalStatus: (data as any).approvalStatus || "APPROVED",
        approvalNote: (data as any).approvalNote || undefined,
        publishAt: (data as any).publishAt || undefined,
        unpublishAt: (data as any).unpublishAt || undefined,
      };

      if (productId) {
        await updateProduct(productId, payload);

        alert("Product updated successfully");
      } else {
        await createProduct(payload);

        alert("Product created successfully");
      }

      reset();

      setVariants([
        {
          color: "",
          size: "",
          stock: 0,
          sku: "",
          barcode: "",
          price: 0,
          availableStock: 0,
          reservedStock: 0,
          lowStockThreshold: 5,
          supplierSku: "",
          warehouseLocation: "",
        },
      ]);

      setSpecifications([
        {
          name: "",
          value: "",
        },
      ]);

      setAttributes([
        {
          name: "",
          value: "",
        },
      ]);

      setImages([]);
      setExistingImages([]);

      setVideo(null);

      setValue("sku", generateSKU("PRODUCT"));
      await loadProductSerials();

      if (typeof window !== "undefined") {
        localStorage.removeItem(draftKey);
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(productId ? "Product update failed" : "Product creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "TEXTAREA") {
          event.preventDefault();
          const fields = Array.from(
            event.currentTarget.querySelectorAll("input, select, textarea, button")
          ).filter((item: any) => !item.disabled && item.type !== "hidden") as HTMLElement[];
          const index = fields.indexOf(event.target as HTMLElement);
          fields[index + 1]?.focus();
        }
      }}
      className="space-y-8"
    >
      <div className="grid gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-black text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40">
        <div>Next Style No: {serialInfo?.nextStyleNo || "Loading..."}</div>
        <div>Next Barcode: {serialInfo?.nextBarcode || "Loading..."}</div>
        <div className="text-xs font-bold opacity-80">
          Last Style No: {serialInfo?.lastStyleNo || "None"} | Last Barcode: {serialInfo?.lastBarcode || "None"}
        </div>
      </div>
      <div className={`${panelClass} space-y-4`}>
        <h2 className="font-bold text-lg">Product Lookup</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={lookupBarcode}
            onChange={(e) => setLookupBarcode(e.target.value)}
            placeholder="Barcode"
            className={inputClass}
          />

          <input
            value={lookupStyleCode}
            onChange={(e) => setLookupStyleCode(e.target.value)}
            placeholder="Style Code"
            className={inputClass}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleFetchProduct}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl"
          >
            Fetch Product
          </button>

          <button
            type="button"
            onClick={handleGenerateCodes}
            className="bg-green-600 text-white px-5 py-3 rounded-xl"
          >
            Generate Codes
          </button>
        </div>
      </div>

      {/* BASIC INFO */}

      <div className="grid md:grid-cols-2 gap-5">
        <input
          {...register("name")}
          placeholder="Product Name"
          className={inputClass}
        />

        <input
          {...register("styleNo")}
          placeholder="Style Number"
          className={inputClass}
        />

        <input {...register("sku")} placeholder="SKU" className={inputClass} />

        <input
          {...register("barcode")}
          placeholder="Barcode"
          className={inputClass}
        />
      </div>

      {/* CATEGORY */}

      <div className="grid md:grid-cols-3 gap-5">
        <select {...register("categoryId")} className={inputClass}>
          <option value="">Category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select {...register("subcategoryId")} className={inputClass}>
          <option value="">Subcategory</option>

          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>

        <select {...register("brandId")} className={inputClass}>
          <option value="">Brand</option>

          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS & VISIBILITY */}

      <div className="grid md:grid-cols-2 gap-5">
        <select {...register("status")} className={inputClass}>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select {...register("visibility")} className={inputClass}>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>

      {/* PRODUCT GOVERNANCE */}
      <div className={panelClass}>
        <h3 className="mb-4 text-lg font-bold">Product Governance</h3>

        <div className="grid gap-5 md:grid-cols-3">
          <select {...register("approvalStatus" as any)} className={inputClass} defaultValue="APPROVED">
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <input
            type="datetime-local"
            {...register("publishAt" as any)}
            className={inputClass}
          />

          <input
            type="datetime-local"
            {...register("unpublishAt" as any)}
            className={inputClass}
          />
        </div>

        <textarea
          {...register("approvalNote" as any)}
          placeholder="Approval / rejection / scheduling note"
          className={`mt-5 h-24 w-full ${inputClass}`}
        />
      </div>

      {/* PRODUCT CONDITION */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Condition
        </label>

        <select
          {...register("condition")}
          className={inputClass}
          defaultValue="NEW"
        >
          <option value="NEW">New</option>
          <option value="USED">Used</option>
          <option value="REFURBISHED">Refurbished</option>
          <option value="OPEN_BOX">Open Box</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={aiLoading}
          className="bg-purple-600 text-white px-5 py-3 rounded-xl"
        >
          {aiLoading ? "Generating..." : "Generate AI Content"}
        </button>
      </div>

      {/* DESCRIPTION */}

      <div className="space-y-4">
        <input
          {...register("seoTitle")}
          placeholder="SEO Title"
          className={`w-full ${inputClass}`}
        />

        <input
          {...register("seoKeywords")}
          placeholder="SEO Keywords"
          className={`w-full ${inputClass}`}
        />

        <textarea
          {...register("seoDescription")}
          placeholder="SEO Description"
          className={`w-full h-28 ${inputClass}`}
        />
      </div>

      <div className={panelClass}>
        <h3 className="font-semibold mb-3">Google Preview</h3>

        <div className="space-y-2">
          <div className="text-blue-700 text-lg">
            {seoTitle || "SEO Title Preview"}
          </div>

          <div className="text-green-700 text-sm">
            https://yourstore.com/product
          </div>

          <div className="text-gray-700 text-sm">
            {seoDescription || "SEO Description Preview"}
          </div>
        </div>
      </div>

      <input
        {...register("shortDescription")}
        placeholder="Short Description"
        className={`w-full ${inputClass}`}
      />

      <textarea
        {...register("description")}
        placeholder="Full Description"
        className={`w-full h-40 ${inputClass}`}
      />

      {/* PRICING */}

      <div className="grid md:grid-cols-3 gap-5">
        <input
          type="number"
          {...register("costPrice" as any)}
          placeholder="Cost Price"
          className={inputClass}
        />

        <input
          type="number"
          {...register("price")}
          placeholder="Selling Price"
          className={inputClass}
        />

        <input
          type="number"
          {...register("discountPrice")}
          placeholder="Discount Price"
          className={inputClass}
        />
      </div>

      {/* FLAGS */}

      <div className="flex gap-10 text-zinc-900 dark:text-zinc-100">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("featured")} />
          Featured
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("trending")} />
          Trending
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className={`${panelClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Specifications</h3>

            <button
              type="button"
              onClick={() => addMetaRow(specifications, setSpecifications)}
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Add
            </button>
          </div>

          {specifications.map((row, index) => (
            <div key={index} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                value={row.name}
                onChange={(e) =>
                  updateMetaRow(
                    specifications,
                    setSpecifications,
                    index,
                    "name",
                    e.target.value,
                  )
                }
                placeholder="Name"
                className={inputClass}
              />

              <input
                value={row.value}
                onChange={(e) =>
                  updateMetaRow(
                    specifications,
                    setSpecifications,
                    index,
                    "value",
                    e.target.value,
                  )
                }
                placeholder="Value"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() =>
                  removeMetaRow(specifications, setSpecifications, index)
                }
                className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className={`${panelClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Attributes</h3>

            <button
              type="button"
              onClick={() => addMetaRow(attributes, setAttributes)}
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Add
            </button>
          </div>

          {attributes.map((row, index) => (
            <div key={index} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                value={row.name}
                onChange={(e) =>
                  updateMetaRow(
                    attributes,
                    setAttributes,
                    index,
                    "name",
                    e.target.value,
                  )
                }
                placeholder="Name"
                className={inputClass}
              />

              <input
                value={row.value}
                onChange={(e) =>
                  updateMetaRow(
                    attributes,
                    setAttributes,
                    index,
                    "value",
                    e.target.value,
                  )
                }
                placeholder="Value"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => removeMetaRow(attributes, setAttributes, index)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VARIANTS */}

      <VariantSection variants={variants} setVariants={setVariants} />

      {/* EXISTING MEDIA */}
      {existingImages.length ? (
        <div className={panelClass}>
          <h3 className="mb-3 font-semibold">Existing Uploaded Images</h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {existingImages.map((url) => (
              <div key={url} className="relative overflow-hidden rounded-xl border dark:border-zinc-800">
                <img
                  src={url.startsWith("/uploads/") ? `${process.env.NEXT_PUBLIC_SERVER_URL || ""}${url}` : url}
                  alt="Product"
                  className="h-36 w-full bg-white object-contain p-2 dark:bg-zinc-950"
                />

                <button
                  type="button"
                  onClick={() =>
                    setExistingImages((prev) =>
                      prev.filter((item) => item !== url)
                    )
                  }
                  className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* MEDIA */}

      <ImageUpload
        images={images}
        setImages={setImages}
        video={video}
        setVideo={setVideo}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        {loading
          ? "Saving..."
          : productId
            ? "Update Product"
            : "Create Product"}
      </button>
    </form>
  );
}















