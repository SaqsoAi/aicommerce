import prisma from "../../config/prisma";

// ================= CONFIG =================

export const getIntegrationConfigService =
async () => {
return prisma.integration.findMany({
orderBy: {
createdAt: "desc",
},
});
};

export const getIntegrationConfigByIdService =
async (id: string) => {
return prisma.integration.findUnique({
where: {
id,
},
});
};

export const createIntegrationConfigService =
async (data: {
name: string;
provider: string;
apiUrl: string;
apiKey?: string;
active?: boolean;
}) => {
return prisma.integration.create({
data: {
name: data.name,
provider: data.provider,
apiUrl: data.apiUrl,
apiKey: data.apiKey ?? null,
active: data.active ?? true,
},
});
};

export const updateIntegrationConfigService =
async (
id: string,
data: {
name?: string;
provider?: string;
apiUrl?: string;
apiKey?: string;
active?: boolean;
}
) => {
return prisma.integration.update({
where: { id },
data,
});
};

export const deleteIntegrationConfigService =
async (id: string) => {
return prisma.integration.delete({
where: { id },
});
};

// ================= LOOKUP =================

export const barcodeLookupService =
async (barcode: string) => {
return prisma.product.findFirst({
where: {
OR: [
{ barcode },
{
variants: {
some: {
barcode,
},
},
},
],
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

export const styleLookupService =
async (styleNo: string) => {
return prisma.product.findFirst({
where: {
styleNo,
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

// ================= AUTO FILL =================

export const autoFillByBarcodeService =
async (barcode: string) => {
return barcodeLookupService(
barcode
);
};

export const autoFillByStyleService =
async (styleNo: string) => {
return styleLookupService(
styleNo
);
};

// ================= SYNC PLACEHOLDER =================

export const syncStockService =
async () => {
return {
success: true,
synced: 0,
message:
"Stock Sync Ready",
};
};

export const syncProductsService =
async () => {
return {
success: true,
synced: 0,
message:
"Product Sync Ready",
};
};