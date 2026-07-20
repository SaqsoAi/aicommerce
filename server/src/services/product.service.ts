import prisma from "../config/prisma";
import { cleanupRemovedProductMedia } from "./product-media-lifecycle.service";

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
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

export const createProductService = async (data: any) => {
  const slug = `${createSlug(data.name)}-${Date.now()}`;
  const autoThumbnail = createThumbnailFromGallery(data.gallery);

  return prisma.product.create({
    data: {
      name: data.name,
      groupName: data.groupName ?? null,
      slug,
      description: data.description,
      shortDescription: data.shortDescription ?? null,
      sku: data.sku,
      styleNo: data.styleNo ?? null,
      barcode: data.barcode ?? null,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      thumbnail: data.thumbnail ?? autoThumbnail,
      videoUrl: data.videoUrl ?? null,
      gallery: data.gallery ?? null,
      categoryId: data.categoryId,
      subcategoryId:
        data.subcategoryId && data.subcategoryId.trim()
          ? data.subcategoryId
          : null,
      brandId: data.brandId ?? null,
      featured: Boolean(data.featured),
      trending: Boolean(data.trending),
      seoTitle: data.seoTitle ?? null,
      seoKeywords: data.seoKeywords ?? null,
      seoDescription: data.seoDescription ?? null,
      specifications: data.specifications ?? null,
      attributes: data.attributes ?? null,
      status: data.status ?? "DRAFT",
      visibility: data.visibility ?? "PUBLIC",
      condition: data.condition ?? "NEW",

      ...(data.gallery?.length
        ? {
            images: {
              create: createImageRowsFromGallery(data.gallery),
            },
          }
        : {}),

      ...(data.variants?.length
        ? {
            variants: {
              create: data.variants.map((v: any, index: number) => ({
                color: v.color,
                size: v.size,
                fabric: v.fabric ?? null,
                occasion: v.occasion ?? null,
                costPrice: v.costPrice ? Number(v.costPrice) : null,
                salesPrice: v.salesPrice
                  ? Number(v.salesPrice)
                  : v.price
                    ? Number(v.price)
                    : null,
                stock: Number(v.stock ?? 0),
                sku:
                  v.sku ||
                  `${data.sku}-${v.color}-${v.size}`.replace(/\s+/g, "-"),
                barcode:
                  v.barcode ||
                  `${data.styleNo || data.sku}${String(index + 1).padStart(
                    2,
                    "0",
                  )}`,
                price: v.price ? Number(v.price) : null,
                availableStock: Number(v.availableStock ?? v.stock ?? 0),
                lowStockThreshold: Number(v.lowStockThreshold ?? 5),
                reservedStock: Number(v.reservedStock ?? 0),
                supplierSku: v.supplierSku ?? null,
                warehouseLocation: v.warehouseLocation ?? null,
              })),
            },
          }
        : {}),
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: true,
      variants: true,
    },
  });
};

export const getProductsService = async () => {
  return prisma.product.findMany({
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getFeaturedProductsService = async () => {
  return prisma.product.findMany({
    where: { featured: true },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      variants: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getTrendingProductsService = async () => {
  return prisma.product.findMany({
    where: { trending: true },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      variants: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getProductByIdService = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      variants: true,
      images: true,
    },
  });
};

export const updateProductService = async (id: string, data: any) => {
  const previousProduct = await prisma.product.findUnique({
    where: { id },
    select: { thumbnail: true, gallery: true, images: { select: { url: true } } },
  });
  const slug = data.name ? `${createSlug(data.name)}-${Date.now()}` : undefined;
  const autoThumbnail = createThumbnailFromGallery(data.gallery);

  const updateData: any = {
    ...(data.name && { name: data.name }),
    ...(data.groupName !== undefined && { groupName: data.groupName }),
    ...(slug && { slug }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.shortDescription !== undefined && {
      shortDescription: data.shortDescription,
    }),
    ...(data.sku && { sku: data.sku }),
    ...(data.styleNo !== undefined && { styleNo: data.styleNo }),
    ...(data.barcode !== undefined && { barcode: data.barcode }),
    ...(data.price !== undefined && { price: Number(data.price) }),
    ...(data.discountPrice !== undefined && {
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    }),
    ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
    ...(autoThumbnail && { thumbnail: autoThumbnail }),
    ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
    ...(data.gallery !== undefined && { gallery: data.gallery }),
    ...(data.categoryId && { categoryId: data.categoryId }),
    ...(data.subcategoryId !== undefined && {
      subcategoryId:
        data.subcategoryId && data.subcategoryId.trim()
          ? data.subcategoryId
          : null,
    }),
    ...(data.brandId !== undefined && {
      brandId: data.brandId && data.brandId !== "" ? data.brandId : null,
    }),
    ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
    ...(data.trending !== undefined && { trending: Boolean(data.trending) }),
    ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
    ...(data.seoKeywords !== undefined && { seoKeywords: data.seoKeywords }),
    ...(data.seoDescription !== undefined && {
      seoDescription: data.seoDescription,
    }),
    ...(data.specifications !== undefined && {
      specifications: data.specifications,
    }),
    ...(data.attributes !== undefined && { attributes: data.attributes }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.visibility !== undefined && { visibility: data.visibility }),
    ...(data.condition !== undefined && { condition: data.condition }),
  };

  if (data.variants && Array.isArray(data.variants)) {
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    updateData.variants = {
      create: data.variants.map((v: any, index: number) => ({
        color: v.color,
        size: v.size,
        fabric: v.fabric ?? null,
        occasion: v.occasion ?? null,
        costPrice: v.costPrice ? Number(v.costPrice) : null,
        salesPrice: v.salesPrice
          ? Number(v.salesPrice)
          : v.price
            ? Number(v.price)
            : null,
        stock: Number(v.stock ?? 0),
        sku: v.sku || `${data.sku}-${v.color}-${v.size}`.replace(/\s+/g, "-"),
        barcode:
          v.barcode ||
          `${data.styleNo || data.sku}${String(index + 1).padStart(2, "0")}`,
        price: v.price ? Number(v.price) : null,
        availableStock: Number(v.availableStock ?? v.stock ?? 0),
        lowStockThreshold: Number(v.lowStockThreshold ?? 5),
        reservedStock: Number(v.reservedStock ?? 0),
        supplierSku: v.supplierSku ?? null,
        warehouseLocation: v.warehouseLocation ?? null,
      })),
    };
  }

  if (data.gallery && Array.isArray(data.gallery)) {
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    updateData.images = {
      create: createImageRowsFromGallery(data.gallery),
    };
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      subcategory: true,
      brand: true,
      variants: true,
      images: true,
    },
  });

  await cleanupRemovedProductMedia(previousProduct, updatedProduct);
  return updatedProduct;
};

export const updateProductStatusService = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      variants: true,
      images: true,
    },
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

  const newSku = `${product.sku}-COPY-${Date.now()}`;
  const newSlug = `${product.slug}-copy-${Date.now()}`;

  return prisma.product.create({
    data: {
      name: `${product.name} Copy`,
      groupName: product.groupName,
      slug: newSlug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: newSku,
      styleNo: product.styleNo ? `${product.styleNo}-COPY` : null,
      barcode: product.barcode ? `${product.barcode}-COPY` : null,
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
          barcode: variant.barcode
            ? `${variant.barcode}-COPY-${index + 1}`
            : "",
          price: variant.price,
          availableStock: variant.availableStock,
          lowStockThreshold: variant.lowStockThreshold,
          reservedStock: variant.reservedStock,
          supplierSku: variant.supplierSku,
          warehouseLocation: variant.warehouseLocation,
        })),
      },
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: true,
      variants: true,
    },
  });
};

export const updateProductSeoService = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data: {
      seoTitle: data.seoTitle ?? null,
      seoKeywords: data.seoKeywords ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
};

export const updateProductGalleryService = async (
  id: string,
  gallery: any[],
) => {
  const previousProduct = await prisma.product.findUnique({
    where: { id },
    select: { thumbnail: true, gallery: true, images: { select: { url: true } } },
  });

  await prisma.productImage.deleteMany({
    where: { productId: id },
  });

  const updatedProduct = await prisma.product.update({
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

  await cleanupRemovedProductMedia(previousProduct, updatedProduct);
  return updatedProduct;
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
