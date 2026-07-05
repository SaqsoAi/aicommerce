import prisma from "../config/prisma";

const PRODUCT_ACTIVE_STATUS = "ACTIVE";
const PRODUCT_ARCHIVED_STATUS = "ARCHIVED";
const PRODUCT_PUBLIC_VISIBILITY = "PUBLIC";
const PRODUCT_HIDDEN_VISIBILITY = "HIDDEN";
const PRODUCT_APPROVED_STATUS = "APPROVED";

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeCode = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed.toUpperCase() : null;
};

const normalizeNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value ?? fallback);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeInteger = (value: unknown, fallback = 0) => {
  const numberValue = Math.trunc(normalizeNumber(value, fallback));
  return numberValue < 0 ? fallback : numberValue;
};

const parseOptionalDate = (value: unknown, field: string) => {
  if (!value) return null;
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${field}`);
  }

  return date;
};

const publicProductWhere = () => {
  const now = new Date();

  return {
    status: PRODUCT_ACTIVE_STATUS,
    visibility: PRODUCT_PUBLIC_VISIBILITY,
    approvalStatus: PRODUCT_APPROVED_STATUS,
    AND: [
      { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
      { OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] },
    ],
  };
};

const normalizeProductImageUrl = (image: any) => {
  if (!image) return null;

  if (typeof image === "string") return image;

  if (image.url) return image.url;

  if (image.fileName) {
    return `/uploads/products/${image.fileName}`;
  }

  return null;
};

const createThumbnailFromGallery = (gallery: any[] | undefined | null) => {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return null;
  }

  const selected =
    gallery.find((item: any) => item?.isThumbnail) || gallery[0];

  return normalizeProductImageUrl(selected);
};

const createImageRowsFromGallery = (gallery: any[]) => {
  return gallery
    .map((image: any, index: number) => ({
      url: normalizeProductImageUrl(image),
      isThumbnail: Boolean(image?.isThumbnail),
      sortOrder: index,
    }))
    .filter((image: any) => Boolean(image.url));
};

const isBlankVariant = (variant: any) => {
  return ![
    variant?.color,
    variant?.size,
    variant?.sku,
    variant?.barcode,
    variant?.supplierSku,
    variant?.warehouseLocation,
  ].some((value) => typeof value === "string" && value.trim().length > 0);
};

const slugCodePart = (value: unknown, fallback: string) => {
  const text = String(value || fallback)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return text || fallback;
};

const validateUniqueList = (items: string[], label: string) => {
  const seen = new Set<string>();

  items.forEach((item) => {
    if (seen.has(item)) {
      throw new Error(`Duplicate ${label}: ${item}`);
    }

    seen.add(item);
  });
};

const normalizeVariantRows = (variants: any[] | undefined, productSku: string, styleNo: string | null, productBarcode: string | null) => {
  if (!Array.isArray(variants)) return [];

  const normalized = variants
    .filter((variant) => !isBlankVariant(variant))
    .map((variant, index) => {
      const color = normalizeText(variant.color);
      const size = normalizeText(variant.size);

      if (!color || !size) {
        throw new Error("Variant color and size are required for every active variant");
      }

      const stock = normalizeInteger(variant.stock, 0);
      const sku =
        normalizeCode(variant.sku) ||
        `${productSku}-${slugCodePart(color, "COLOR")}-${slugCodePart(size, "SIZE")}`;
      const barcode =
        normalizeCode(variant.barcode) ||
        `${productBarcode || styleNo || productSku}-${String(index + 1).padStart(2, "0")}`;

      return {
        color,
        size,
        fabric: normalizeText(variant.fabric),
        occasion: normalizeText(variant.occasion),
        costPrice: variant.costPrice !== undefined ? normalizeNumber(variant.costPrice, 0) : null,
        salesPrice:
          variant.salesPrice !== undefined
            ? normalizeNumber(variant.salesPrice, 0)
            : variant.price !== undefined
              ? normalizeNumber(variant.price, 0)
              : null,
        stock,
        sku,
        barcode,
        styleNo,
        price: variant.price !== undefined ? normalizeNumber(variant.price, 0) : null,
        availableStock: normalizeInteger(variant.availableStock ?? stock, stock),
        lowStockThreshold: normalizeInteger(variant.lowStockThreshold, 5),
        reservedStock: normalizeInteger(variant.reservedStock, 0),
        supplierSku: normalizeText(variant.supplierSku),
        warehouseLocation: normalizeText(variant.warehouseLocation),
        active: true,
      };
    });

  validateUniqueList(normalized.map((variant) => variant.sku), "variant SKU");
  validateUniqueList(normalized.map((variant) => variant.barcode), "variant barcode");

  if (normalized.some((variant) => variant.sku === productSku)) {
    throw new Error("Variant SKU cannot duplicate the product SKU");
  }

  if (productBarcode && normalized.some((variant) => variant.barcode === productBarcode)) {
    throw new Error("Variant barcode cannot duplicate the product barcode");
  }

  const combinationKeys = normalized.map(
    (variant) => `${String(variant.color).toLowerCase()}|${String(variant.size).toLowerCase()}`,
  );

  validateUniqueList(combinationKeys, "variant color/size combination");

  return normalized;
};

const validateProductReferences = async (data: any) => {
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new Error("Category not found");
  }

  if (data.subcategoryId) {
    const subcategory = await prisma.subcategory.findUnique({ where: { id: data.subcategoryId } });
    if (!subcategory) throw new Error("Subcategory not found");
    if (data.categoryId && subcategory.categoryId !== data.categoryId) {
      throw new Error("Subcategory does not belong to the selected category");
    }
  }

  if (data.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) throw new Error("Brand not found");
  }
};

const validateCodeUniqueness = async ({
  productId,
  sku,
  styleNo,
  barcode,
  variants,
}: {
  productId?: string;
  sku?: string | null;
  styleNo?: string | null;
  barcode?: string | null;
  variants: Array<{ sku: string; barcode: string }>;
}) => {
  const productOr: any[] = [];
  if (sku) productOr.push({ sku });
  if (styleNo) productOr.push({ styleNo });
  if (barcode) productOr.push({ barcode });

  if (productOr.length) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        OR: productOr,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { sku: true, styleNo: true, barcode: true },
    });

    if (duplicateProduct?.sku === sku) throw new Error(`Duplicate product SKU: ${sku}`);
    if (styleNo && duplicateProduct?.styleNo === styleNo) throw new Error(`Duplicate style number: ${styleNo}`);
    if (barcode && duplicateProduct?.barcode === barcode) throw new Error(`Duplicate product barcode: ${barcode}`);
  }

  const variantOr = variants.flatMap((variant) => [
    { sku: variant.sku },
    { barcode: variant.barcode },
  ]);

  if (sku) variantOr.push({ sku });
  if (barcode) variantOr.push({ barcode });

  if (variantOr.length) {
    const duplicateVariant = await prisma.productVariant.findFirst({
      where: {
        OR: variantOr,
        ...(productId ? { NOT: { productId } } : {}),
      },
      select: { sku: true, barcode: true },
    });

    if (duplicateVariant?.sku) throw new Error(`Duplicate variant SKU: ${duplicateVariant.sku}`);
    if (duplicateVariant?.barcode) throw new Error(`Duplicate variant barcode: ${duplicateVariant.barcode}`);
  }
};

const normalizeProductBaseData = (data: any) => {
  const status = normalizeCode(data.status) || "DRAFT";
  const visibility = status === PRODUCT_ARCHIVED_STATUS ? PRODUCT_HIDDEN_VISIBILITY : normalizeCode(data.visibility) || PRODUCT_PUBLIC_VISIBILITY;
  const publishAt = parseOptionalDate(data.publishAt, "publishAt");
  const unpublishAt = parseOptionalDate(data.unpublishAt, "unpublishAt");

  if (publishAt && unpublishAt && publishAt >= unpublishAt) {
    throw new Error("publishAt must be before unpublishAt");
  }

  return {
    name: String(data.name).trim(),
    groupName: normalizeText(data.groupName),
    description: String(data.description).trim(),
    shortDescription: normalizeText(data.shortDescription),
    sku: normalizeCode(data.sku) || "",
    styleNo: normalizeCode(data.styleNo),
    barcode: normalizeCode(data.barcode),
    price: normalizeNumber(data.price, 0),
    discountPrice: data.discountPrice !== undefined ? normalizeNumber(data.discountPrice, 0) : null,
    thumbnail: normalizeText(data.thumbnail),
    videoUrl: normalizeText(data.videoUrl),
    gallery: data.gallery ?? null,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId ? data.subcategoryId : null,
    brandId: data.brandId ? data.brandId : null,
    featured: status === PRODUCT_ARCHIVED_STATUS ? false : Boolean(data.featured),
    trending: status === PRODUCT_ARCHIVED_STATUS ? false : Boolean(data.trending),
    seoTitle: normalizeText(data.seoTitle),
    seoKeywords: normalizeText(data.seoKeywords),
    seoDescription: normalizeText(data.seoDescription),
    specifications: data.specifications ?? null,
    attributes: data.attributes ?? null,
    status,
    visibility,
    condition: normalizeCode(data.condition) || "NEW",
    approvalStatus: normalizeCode(data.approvalStatus) || PRODUCT_APPROVED_STATUS,
    approvalNote: normalizeText(data.approvalNote),
    publishAt,
    unpublishAt,
  };
};

const productInclude = {
  category: true,
  subcategory: true,
  brand: true,
  images: true,
  variants: true,
};

export const createProductService = async (data: any) => {
  const baseData = normalizeProductBaseData(data);
  const slug = `${createSlug(baseData.name)}-${Date.now()}`;
  const autoThumbnail = createThumbnailFromGallery(data.gallery);
  const variants = normalizeVariantRows(data.variants, baseData.sku, baseData.styleNo, baseData.barcode);

  await validateProductReferences(baseData);
  await validateCodeUniqueness({
    sku: baseData.sku,
    styleNo: baseData.styleNo,
    barcode: baseData.barcode,
    variants,
  });

  return prisma.product.create({
    data: ({
      ...baseData,
      slug,
      thumbnail: baseData.thumbnail ?? autoThumbnail,
      ...(data.gallery?.length
        ? {
            images: {
              create: createImageRowsFromGallery(data.gallery),
            },
          }
        : {}),
      ...(variants.length
        ? {
            variants: {
              create: variants,
            },
          }
        : {}),
    } as any),
    include: productInclude,
  });
};

export const getProductsService = async () => {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getFeaturedProductsService = async () => {
  return prisma.product.findMany({
    where: { featured: true, ...publicProductWhere() },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getTrendingProductsService = async () => {
  return prisma.product.findMany({
    where: { trending: true, ...publicProductWhere() },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getProductByIdService = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
};

export const updateProductService = async (id: string, data: any) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!existingProduct) throw new Error("Product not found");

  const mergedData = {
    ...existingProduct,
    ...data,
    categoryId: data.categoryId ?? existingProduct.categoryId,
    subcategoryId: data.subcategoryId ?? existingProduct.subcategoryId,
    brandId: data.brandId ?? existingProduct.brandId,
    variants: data.variants,
  };

  const baseData = normalizeProductBaseData(mergedData);
  const slug = data.name ? `${createSlug(baseData.name)}-${Date.now()}` : undefined;
  const autoThumbnail = createThumbnailFromGallery(data.gallery);
  const variants = Array.isArray(data.variants)
    ? normalizeVariantRows(data.variants, baseData.sku, baseData.styleNo, baseData.barcode)
    : [];

  await validateProductReferences(baseData);
  await validateCodeUniqueness({
    productId: id,
    sku: baseData.sku,
    styleNo: baseData.styleNo,
    barcode: baseData.barcode,
    variants: Array.isArray(data.variants)
      ? variants
      : existingProduct.variants.map((variant) => ({ sku: variant.sku, barcode: variant.barcode || "" })).filter((variant) => variant.barcode),
  });

  const updateData: any = {
    ...(data.name !== undefined && { name: baseData.name }),
    ...(data.groupName !== undefined && { groupName: baseData.groupName }),
    ...(slug && { slug }),
    ...(data.description !== undefined && { description: baseData.description }),
    ...(data.shortDescription !== undefined && { shortDescription: baseData.shortDescription }),
    ...(data.sku !== undefined && { sku: baseData.sku }),
    ...(data.styleNo !== undefined && { styleNo: baseData.styleNo }),
    ...(data.barcode !== undefined && { barcode: baseData.barcode }),
    ...(data.price !== undefined && { price: baseData.price }),
    ...(data.discountPrice !== undefined && { discountPrice: baseData.discountPrice }),
    ...(data.thumbnail !== undefined && { thumbnail: baseData.thumbnail }),
    ...(autoThumbnail && { thumbnail: autoThumbnail }),
    ...(data.videoUrl !== undefined && { videoUrl: baseData.videoUrl }),
    ...(data.gallery !== undefined && { gallery: baseData.gallery }),
    ...(data.categoryId !== undefined && { categoryId: baseData.categoryId }),
    ...(data.subcategoryId !== undefined && { subcategoryId: baseData.subcategoryId }),
    ...(data.brandId !== undefined && { brandId: baseData.brandId }),
    ...(data.featured !== undefined && { featured: baseData.featured }),
    ...(data.trending !== undefined && { trending: baseData.trending }),
    ...(data.seoTitle !== undefined && { seoTitle: baseData.seoTitle }),
    ...(data.seoKeywords !== undefined && { seoKeywords: baseData.seoKeywords }),
    ...(data.seoDescription !== undefined && { seoDescription: baseData.seoDescription }),
    ...(data.specifications !== undefined && { specifications: baseData.specifications }),
    ...(data.attributes !== undefined && { attributes: baseData.attributes }),
    ...(data.status !== undefined && { status: baseData.status }),
    ...(data.visibility !== undefined && { visibility: baseData.visibility }),
    ...(data.condition !== undefined && { condition: baseData.condition }),
    ...(data.approvalStatus !== undefined && { approvalStatus: baseData.approvalStatus }),
    ...(data.approvalNote !== undefined && { approvalNote: baseData.approvalNote }),
    ...(data.publishAt !== undefined && { publishAt: baseData.publishAt }),
    ...(data.unpublishAt !== undefined && { unpublishAt: baseData.unpublishAt }),
  };

  return prisma.$transaction(async (tx: any) => {
    if (Array.isArray(data.variants)) {
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { active: false },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      updateData.variants = {
        create: variants,
      };
    }

    if (Array.isArray(data.gallery)) {
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      updateData.images = {
        create: createImageRowsFromGallery(data.gallery),
      };
    }

    return tx.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
  });
};

export const updateProductStatusService = async (id: string, data: any) => {
  const status = normalizeCode(data.status);
  const visibility = status === PRODUCT_ARCHIVED_STATUS ? PRODUCT_HIDDEN_VISIBILITY : normalizeCode(data.visibility);

  return prisma.product.update({
    where: { id },
    data: {
      ...(status !== null && { status }),
      ...(visibility !== null && { visibility }),
      ...(status === PRODUCT_ARCHIVED_STATUS && { featured: false, trending: false }),
    },
    include: productInclude,
  });
};

export const duplicateProductService = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, images: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const suffix = Date.now();
  const newSku = `${product.sku}-COPY-${suffix}`.toUpperCase();
  const newSlug = `${product.slug}-copy-${suffix}`;
  const newStyleNo = product.styleNo ? `${product.styleNo}-COPY-${suffix}`.toUpperCase() : null;
  const newBarcode = product.barcode ? `${product.barcode}-COPY-${suffix}`.toUpperCase() : null;

  return prisma.product.create({
    data: {
      name: `${product.name} Copy`,
      groupName: product.groupName,
      slug: newSlug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: newSku,
      styleNo: newStyleNo,
      barcode: newBarcode,
      price: product.price,
      discountPrice: product.discountPrice,
      thumbnail:
        product.thumbnail ||
        product.images.find((image) => image.isThumbnail)?.url ||
        product.images[0]?.url ||
        null,
      videoUrl: product.videoUrl,
      gallery: product.gallery as any,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      featured: false,
      trending: false,
      seoTitle: product.seoTitle,
      seoKeywords: product.seoKeywords,
      seoDescription: product.seoDescription,
      specifications: product.specifications as any,
      attributes: product.attributes as any,
      status: "DRAFT",
      visibility: product.visibility,
      approvalStatus: "DRAFT",
      condition: product.condition,
      images: {
        create: product.images.map((image) => ({
          url: image.url,
          isThumbnail: image.isThumbnail,
          sortOrder: image.sortOrder,
        })),
      },
      variants: {
        create: product.variants.map((variant, index) => ({
          color: variant.color,
          size: variant.size,
          fabric: variant.fabric,
          occasion: variant.occasion,
          costPrice: variant.costPrice,
          salesPrice: variant.salesPrice,
          stock: variant.stock,
          sku: `${newSku}-${index + 1}`,
          barcode: `${newBarcode || newStyleNo || newSku}-${index + 1}`,
          styleNo: newStyleNo,
          price: variant.price,
          availableStock: variant.availableStock,
          lowStockThreshold: variant.lowStockThreshold,
          reservedStock: variant.reservedStock,
          supplierSku: variant.supplierSku,
          warehouseLocation: variant.warehouseLocation,
          active: true,
        })),
      },
    },
    include: productInclude,
  });
};

export const archiveProductService = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!product) throw new Error("Product not found");

  return prisma.$transaction(async (tx: any) => {
    await tx.productVariant.updateMany({
      where: { productId: id },
      data: { active: false },
    });

    await tx.cart.deleteMany({
      where: { productId: id },
    });

    return tx.product.update({
      where: { id },
      data: {
        status: PRODUCT_ARCHIVED_STATUS,
        visibility: PRODUCT_HIDDEN_VISIBILITY,
        featured: false,
        trending: false,
        unpublishAt: new Date(),
      },
      include: productInclude,
    });
  });
};

export const updateProductSeoService = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data: {
      seoTitle: normalizeText(data.seoTitle),
      seoKeywords: normalizeText(data.seoKeywords),
      seoDescription: normalizeText(data.seoDescription),
    },
  });
};

export const updateProductGalleryService = async (
  id: string,
  gallery: any[],
) => {
  await prisma.productImage.deleteMany({
    where: { productId: id },
  });

  return prisma.product.update({
    where: { id },
    data: {
      gallery,
      thumbnail: createThumbnailFromGallery(gallery),
      images: {
        create: createImageRowsFromGallery(gallery),
      },
    },
    include: {
      images: true,
    },
  });
};

export const updateProductSpecificationsService = async (
  id: string,
  specifications: any[],
) => {
  return prisma.product.update({
    where: { id },
    data: { specifications },
  });
};

export const updateProductAttributesService = async (
  id: string,
  attributes: any[],
) => {
  return prisma.product.update({
    where: { id },
    data: { attributes },
  });
};

