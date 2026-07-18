import prisma from "../config/prisma";

type Row = {
  supplierName: string;
  supplierCode: string;
  brand: string;
  category: string;
  subcategory: string;
  productName: string;
  size: string;
  color: string;
  styleNo: string;
  barcode: string;
  systemBarcode: string;
  costPrice: number;
  salePrice: number;
  receiveQuantity: number;
};

const rows: Row[] = [
  ["SAQSO AI STUDIO","SUP00001","SAQSO","Mens Ware","Mens POLO","Polo Shirt H/S","S","BLACK","SS-000001","A000001","SS000001",890,1990,10],
  ["SAQSO AI STUDIO","SUP00001","SAQSO","Mens Ware","Mens POLO","Polo Shirt H/S","M","BLACK","SS-000002","A000002","SS000002",890,1990,20],
  ["SAQSO AI STUDIO","SUP00001","SAQSO","Mens Ware","Mens POLO","Polo Shirt H/S","L","BLACK","SS-000003","A000003","SS000003",890,1990,10],
  ["SAQSO AI STUDIO","SUP00001","SAQSO","Mens Ware","Mens POLO","Polo Shirt H/S","XL","BLACK","SS-000004","A000004","SS000004",890,1990,20],

  ["SUQSO IMPORT","SUP00002","IMPORTED","Mens Ware","Mens SHIRT","Mens SHIRT F/S","15","BROWN","SS-000005","A000005","SS000005",1890,3490,5],
  ["SUQSO IMPORT","SUP00002","IMPORTED","Mens Ware","Mens SHIRT","Mens SHIRT F/S","16","BROWN","SS-000006","A000006","SS000006",1890,3490,10],
  ["SUQSO IMPORT","SUP00002","IMPORTED","Mens Ware","Mens SHIRT","Mens SHIRT F/S","16.5","BROWN","SS-000007","A000007","SS000007",1890,3490,5],
  ["SUQSO IMPORT","SUP00002","IMPORTED","Mens Ware","Mens SHIRT","Mens SHIRT F/S","17","BROWN","SS-000008","A000008","SS000008",1890,3490,10],

  ["MARKET IMPORT","SUP00003","IMPORTED","Womens Ware","Ladies PANT","Denim Long Pant","30","SKY","SS-000009","A000009","SS000009",1290,3490,10],
  ["MARKET IMPORT","SUP00003","IMPORTED","Womens Ware","Ladies PANT","Denim Long Pant","32","SKY","SS-000010","A000010","SS000010",1290,3490,20],
  ["MARKET IMPORT","SUP00003","IMPORTED","Womens Ware","Ladies PANT","Denim Long Pant","34","SKY","SS-000011","A000011","SS000011",1290,3490,10],
  ["MARKET IMPORT","SUP00003","IMPORTED","Womens Ware","Ladies PANT","Denim Long Pant","36","SKY","SS-000012","A000012","SS000012",1290,3490,20],
  ["MARKET IMPORT","SUP00003","IMPORTED","Womens Ware","Ladies PANT","Denim Long Pant","38","SKY","SS-000013","A000013","SS000013",1290,3490,5],
].map((item) => ({
  supplierName: item[0] as string,
  supplierCode: item[1] as string,
  brand: item[2] as string,
  category: item[3] as string,
  subcategory: item[4] as string,
  productName: item[5] as string,
  size: item[6] as string,
  color: item[7] as string,
  styleNo: item[8] as string,
  barcode: item[9] as string,
  systemBarcode: item[10] as string,
  costPrice: item[11] as number,
  salePrice: item[12] as number,
  receiveQuantity: item[13] as number,
}));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  const supplierGroups = new Map<string, Row[]>();

  for (const row of rows) {
    const list = supplierGroups.get(row.supplierCode) || [];
    list.push(row);
    supplierGroups.set(row.supplierCode, list);
  }

  let productCount = 0;
  let variantCount = 0;
  let totalReceived = 0;

  for (const [supplierCode, supplierRows] of supplierGroups) {
    const first = supplierRows[0];

    if (!first) continue;

    const supplier = await prisma.supplier.upsert({
      where: {
        supplierCode,
      },
      update: {
        name: first.supplierName,
        active: true,
        notes: `Seeded supplier code: ${supplierCode}`,
      },
      create: {
        name: first.supplierName,
        supplierCode,
        active: true,
        notes: `Seeded supplier code: ${supplierCode}`,
      },
    });

    const orderNumber = `PO-${supplierCode}-SEED`;

    const purchaseOrder = await prisma.purchaseOrder.upsert({
      where: {
        orderNumber,
      },
      update: {
        supplierId: supplier.id,
        status: "RECEIVED",
        totalAmount: supplierRows.reduce(
          (sum, row) => sum + row.costPrice * row.receiveQuantity,
          0
        ),
        notes: "Seeded purchase receive flow",
      },
      create: {
        supplierId: supplier.id,
        orderNumber,
        status: "RECEIVED",
        totalAmount: supplierRows.reduce(
          (sum, row) => sum + row.costPrice * row.receiveQuantity,
          0
        ),
        notes: "Seeded purchase receive flow",
      },
    });

    await prisma.purchaseOrderItem.deleteMany({
      where: {
        purchaseOrderId: purchaseOrder.id,
      },
    });

    await prisma.inventoryTransaction.deleteMany({
      where: {
        referenceId: orderNumber,
      },
    });

    for (const row of supplierRows) {
      const brand = await prisma.brand.upsert({
        where: {
          name: row.brand,
        },
        update: {},
        create: {
          name: row.brand,
        },
      });

      const categorySlug = slugify(row.category);

      const category = await prisma.category.upsert({
        where: {
          slug: categorySlug,
        },
        update: {
          name: row.category,
        },
        create: {
          name: row.category,
          slug: categorySlug,
        },
      });

      const subcategorySlug = slugify(`${row.category}-${row.subcategory}`);

      const subcategory = await prisma.subcategory.upsert({
        where: {
          slug: subcategorySlug,
        },
        update: {
          name: row.subcategory,
          categoryId: category.id,
        },
        create: {
          name: row.subcategory,
          slug: subcategorySlug,
          categoryId: category.id,
        },
      });

      const productSlug = slugify(
        `${row.brand}-${row.category}-${row.subcategory}-${row.productName}`
      );

      const product = await prisma.product.upsert({
        where: {
          slug: productSlug,
        },
        update: {
          name: row.productName,
          groupName: row.productName,
          description: `Premium ${row.productName} from ${row.brand}.`,
          shortDescription: `${row.productName} - ${row.color}`,
          price: row.salePrice,
          discountPrice: null,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          brandId: brand.id,
          status: "ACTIVE",
          visibility: "PUBLIC",
          condition: "NEW",
          styleNo: row.styleNo,
        },
        create: {
          name: row.productName,
          groupName: row.productName,
          description: `Premium ${row.productName} from ${row.brand}.`,
          shortDescription: `${row.productName} - ${row.color}`,
          price: row.salePrice,
          sku: `PRODUCT-${productSlug}`,
          slug: productSlug,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          brandId: brand.id,
          status: "ACTIVE",
          visibility: "PUBLIC",
          condition: "NEW",
          styleNo: row.styleNo,
          featured: true,
          trending: true,
          aiGenerated: false,
        },
      });

      productCount += 1;

      const variant = await prisma.productVariant.upsert({
        where: {
          sku: row.systemBarcode,
        },
        update: {
          productId: product.id,
          color: row.color,
          size: row.size,
          barcode: row.barcode,
          styleNo: row.styleNo,
          systemBarcode: row.systemBarcode,
          costPrice: row.costPrice,
          salesPrice: row.salePrice,
          price: row.salePrice,
          stock: row.receiveQuantity,
          availableStock: row.receiveQuantity,
          reservedStock: 0,
          lowStockThreshold: 5,
          active: true,
          supplierSku: supplierCode,
          warehouseLocation: "MAIN",
        },
        create: {
          productId: product.id,
          color: row.color,
          size: row.size,
          sku: row.systemBarcode,
          barcode: row.barcode,
          styleNo: row.styleNo,
          systemBarcode: row.systemBarcode,
          costPrice: row.costPrice,
          salesPrice: row.salePrice,
          price: row.salePrice,
          stock: row.receiveQuantity,
          availableStock: row.receiveQuantity,
          reservedStock: 0,
          lowStockThreshold: 5,
          active: true,
          supplierSku: supplierCode,
          warehouseLocation: "MAIN",
        },
      });

      variantCount += 1;
      totalReceived += row.receiveQuantity;

      await prisma.purchaseOrderItem.create({
        data: {
          purchaseOrderId: purchaseOrder.id,
          productId: product.id,
          quantity: row.receiveQuantity,
          costPrice: row.costPrice,
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          transactionType: "SUPPLIER_RECEIVE",
          quantity: row.receiveQuantity,
          previousStock: 0,
          newStock: row.receiveQuantity,
          referenceId: orderNumber,
          notes: `${row.supplierName} / ${row.styleNo} / ${row.systemBarcode}`,
        },
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        message: "Purchase receive seed completed",
        suppliers: supplierGroups.size,
        productsTouched: productCount,
        variantsTouched: variantCount,
        totalReceived,
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
