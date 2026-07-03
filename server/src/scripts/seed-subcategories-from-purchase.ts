import prisma from "../config/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const rows = [
  {
    categoryName: "Mens Ware",
    subcategoryName: "Mens POLO",
  },
  {
    categoryName: "Mens Ware",
    subcategoryName: "Mens SHIRT",
  },
  {
    categoryName: "Womens Ware",
    subcategoryName: "Ladies PANT",
  },
];

async function main() {
  const result = [];

  for (const row of rows) {
    const categorySlug = slugify(row.categoryName);

    const category = await prisma.category.upsert({
      where: {
        slug: categorySlug,
      },
      update: {
        name: row.categoryName,
      },
      create: {
        name: row.categoryName,
        slug: categorySlug,
      },
    });

    const subcategorySlug = slugify(
      `${row.categoryName}-${row.subcategoryName}`
    );

    const subcategory = await prisma.subcategory.upsert({
      where: {
        slug: subcategorySlug,
      },
      update: {
        name: row.subcategoryName,
        categoryId: category.id,
      },
      create: {
        name: row.subcategoryName,
        slug: subcategorySlug,
        categoryId: category.id,
      },
    });

    result.push({
      category: category.name,
      subcategory: subcategory.name,
      slug: subcategory.slug,
    });
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        message: "Subcategories upsert completed",
        total: result.length,
        data: result,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
