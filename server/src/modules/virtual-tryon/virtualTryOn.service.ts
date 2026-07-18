import fs from "fs";
import path from "path";
import prisma from "../../config/prisma";
import { runVirtualTryOn } from "../../ai/virtualTryOn.engine";

export const createVirtualTryOnJob = async (payload: {
  userId: string;
  productId: string;
  personImage: string;
}) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const gallery = Array.isArray(product.gallery) ? product.gallery : [];

  const garmentImage =
    product.thumbnail ||
    (typeof gallery[0] === "string" ? gallery[0] : "");

  if (!garmentImage) {
    throw new Error("Product garment image not found");
  }

  const job = await prisma.virtualTryOnJob.create({
    data: {
      userId: payload.userId,
      productId: payload.productId,
      personImage: payload.personImage,
      garmentImage,
      provider: "FAL_FASHN",
      status: "PROCESSING",
    },
  });

  try {
    const resultImage = await runVirtualTryOn(
      payload.personImage,
      garmentImage
    );

    return await prisma.virtualTryOnJob.update({
      where: { id: job.id },
      data: {
        resultImage,
        status: "COMPLETED",
      },
      include: {
        product: true,
        user: true,
      },
    });
  } catch (error: any) {
    return await prisma.virtualTryOnJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: error?.message || "Virtual Try-On failed",
      },
      include: {
        product: true,
        user: true,
      },
    });
  }
};

export const getVirtualTryOnJobById = async (id: string) => {
  return prisma.virtualTryOnJob.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
    },
  });
};

export const getVirtualTryOnHistory = async (userId?: string) => {
  return prisma.virtualTryOnJob.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      user: true,
    },
  });
};

export const getMyVirtualTryOnHistory = async (userId: string) => {
  return prisma.virtualTryOnJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
    },
  });
};

export const deleteVirtualTryOnJob = async (id: string) => {
  return prisma.virtualTryOnJob.delete({
    where: { id },
  });
};

export const deleteMyVirtualTryOnJob = async (
  userId: string,
  id: string
) => {
  return prisma.virtualTryOnJob.deleteMany({
    where: {
      id,
      userId,
    },
  });
};

export const retryVirtualTryOnJob = async (
  userId: string,
  id: string
) => {
  const oldJob = await prisma.virtualTryOnJob.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!oldJob) {
    throw new Error("Virtual Try-On job not found");
  }

  return createVirtualTryOnJob({
    userId,
    productId: oldJob.productId,
    personImage: oldJob.personImage,
  });
};

const settingsPath = path.join(
  process.cwd(),
  "data",
  "virtual-tryon-settings.json"
);

const defaultVirtualTryOnSettings = {
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
};

export const getVirtualTryOnSettings = async () => {
  if (!fs.existsSync(settingsPath)) {
    return defaultVirtualTryOnSettings;
  }

  return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
};

export const updateVirtualTryOnSettings = async (
  payload: { sizes: string[] }
) => {
  const dir = path.dirname(settingsPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const settings = {
    sizes:
      payload.sizes?.length > 0
        ? payload.sizes
        : defaultVirtualTryOnSettings.sizes,
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return settings;
};
