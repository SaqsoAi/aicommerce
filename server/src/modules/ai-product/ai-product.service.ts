export const generateProductContent =
  async (
    name: string,
    category: string,
    brand?: string
  ) => {
    return {
      shortDescription:
        `${name} is a premium ${category} product designed for everyday use.`,

      description:
        `${name} delivers excellent quality, comfort and durability. Perfect for customers looking for reliable ${category} products with modern design and long-lasting performance.`,

      seoTitle:
        `${name} | Premium ${category}`,

      metaDescription:
        `Buy ${name} online. High quality ${category} product with excellent value.`,

      tags: [
        category,
        brand || "",
        name,
      ].filter(Boolean),
    };
  };