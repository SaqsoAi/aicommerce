import prisma from "../../config/prisma";

const PRICE_RANGES = [
  { label: "৳0 - ৳500", min: 0, max: 500 },
  { label: "৳500 - ৳1000", min: 500, max: 1000 },
  { label: "৳1000 - ৳2000", min: 1000, max: 2000 },
  { label: "৳2000 - ৳3000", min: 2000, max: 3000 },
  { label: "৳3000+", min: 3000, max: null },
];

function uniqueClean(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  ).sort();
}

function getAttributeValue(attributes: unknown, key: string) {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return null;
  }

  const record = attributes as Record<string, unknown>;
  const value = record[key];

  if (typeof value === "string") return value;
  return null;
}

export const productCatalogService = {
  async getFilters() {
    const [categories, variants, products, campaigns, coupons] = await Promise.all([
      prisma.category.findMany({
        include: {
          subcategories: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.productVariant.findMany({
        select: {
          size: true,
          color: true,
          occasion: true,        },
      }),

      prisma.product.findMany({
        select: {
          attributes: true,
        },
      }),

      prisma.campaign.findMany({
        where: {
          active: true,
        },
        take: 12,
        orderBy: {
          startDate: "desc",
        },
      }),

      prisma.coupon.findMany({
        where: {
          active: true,
        },
        take: 12,
        orderBy: {
          expiryDate: "desc",
        },
      }),
    ]);

    const occasionsFromProduct = products.map((product) =>
      getAttributeValue(product.attributes, "occasion")
    );
    const styles = products.map((product) =>
      getAttributeValue(product.attributes, "style")
    );
    const sustainability = products.map((product) =>
      getAttributeValue(product.attributes, "sustainability")
    );

    return {
      hotOffers: [
        ...campaigns.map((item) => ({
          id: item.id,
          label: item.title,
          type: "campaign",
          discountValue: item.discountValue,
        })),
        ...coupons.map((item) => ({
          id: item.id,
          label: item.code,
          type: "coupon",
          discountValue: item.discount,
        })),
      ],
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        subcategories: category.subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
        })),
      })),
      sizes: uniqueClean(variants.map((variant) => variant.size)),
      colors: uniqueClean(variants.map((variant) => variant.color)),
      fits: uniqueClean(products.map((product) => getAttributeValue(product.attributes, "fit"))),
      occasions: uniqueClean([
        ...variants.map((variant) => variant.occasion),
        ...occasionsFromProduct,
      ]),
      styles: uniqueClean(styles),
      sustainability: uniqueClean(sustainability),
      priceRanges: PRICE_RANGES,
    };
  },

  async getProducts(query: Record<string, unknown>) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 24), 60);
    const skip = (page - 1) * limit;

    const category = query.category ? String(query.category) : "";
    const subcategory = query.subcategory ? String(query.subcategory) : "";
    const brand = query.brand ? String(query.brand) : "";
    const size = query.size ? String(query.size) : "";
    const color = query.color ? String(query.color) : "";
    const occasion = query.occasion ? String(query.occasion) : "";
    const search = query.search ? String(query.search) : "";
    const priceMin = query.priceMin !== undefined ? Number(query.priceMin) : undefined;
    const priceMax = query.priceMax !== undefined ? Number(query.priceMax) : undefined;
    const sort = query.sort ? String(query.sort) : "latest";

    const where: any = {};

    if (category) where.category = { slug: category };
    if (subcategory) where.subcategory = { slug: subcategory };
    if (brand) where.brand = { id: brand };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { styleNo: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined && !Number.isNaN(priceMin)) where.price.gte = priceMin;
      if (priceMax !== undefined && !Number.isNaN(priceMax)) where.price.lte = priceMax;
    }

    if (size || color || occasion) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {}),
          ...(occasion ? { occasion } : {}),
        },
      };
    }

    const orderBy =
      sort === "price-low"
        ? { price: "asc" as const }
        : sort === "price-high"
          ? { price: "desc" as const }
          : sort === "trending"
            ? { trending: "desc" as const }
            : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          subcategory: true,
          brand: true,
          variants: true,
          reviews: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStylistPicks() {
    return prisma.lookbook.findMany({
      take: 8,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        items: true,
      },
    });
  },

  async getRecommended() {
    return prisma.product.findMany({
      where: {
        OR: [
          { featured: true },
          { trending: true },
        ],
      },
      take: 12,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: true,
      },
    });
  },
};