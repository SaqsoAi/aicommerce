import prisma from "../../prisma/prisma";
import { deleteProductMediaIfOrphaned } from "../../services/product-media-lifecycle.service";

export const getAllMedia = async () => {
  return prisma.media.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProductImages = async (
  productId: string
) => {
  return prisma.productImage.findMany({
    where: {
      productId,
    },

    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const createProductImage = async (
  productId: string,
  data: {
    url: string;
    isThumbnail?: boolean;
    sortOrder?: number;
  }
) => {
  return prisma.productImage.create({
    data: {
      productId,

      url: data.url,

      isThumbnail:
        data.isThumbnail ?? false,

      sortOrder:
        data.sortOrder ?? 0,
    },
  });
};

export const setThumbnailImage =
  async (
    imageId: string
  ) => {
    const image =
      await prisma.productImage.findUnique({
        where: {
          id: imageId,
        },
      });

    if (!image) {
      throw new Error(
        "Image not found"
      );
    }

    await prisma.productImage.updateMany({
      where: {
        productId:
          image.productId,
      },

      data: {
        isThumbnail: false,
      },
    });

    return prisma.productImage.update({
      where: {
        id: imageId,
      },

      data: {
        isThumbnail: true,
      },
    });
  };

export const reorderImages =
  async (
    items: {
      id: string;
      sortOrder: number;
    }[]
  ) => {
    await Promise.all(
      items.map((item) =>
        prisma.productImage.update({
          where: {
            id: item.id,
          },

          data: {
            sortOrder:
              item.sortOrder,
          },
        })
      )
    );

    return true;
  };

export const deleteProductImage = async (imageId: string) => {
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });
  if (!image) throw new Error("Image not found");

  const product = await prisma.product.findUnique({
    where: { id: image.productId },
    select: { thumbnail: true, gallery: true },
  });

  const gallery = Array.isArray(product?.gallery)
    ? (product?.gallery as any[]).filter((item: any) => {
        const url = typeof item === "string" ? item : item?.url;
        return String(url || "") !== image.url;
      })
    : product?.gallery;

  await prisma.$transaction([
    prisma.productImage.delete({ where: { id: imageId } }),
    prisma.product.update({
      where: { id: image.productId },
      data: {
        ...(Array.isArray(gallery) ? { gallery } : {}),
        ...(product?.thumbnail === image.url ? { thumbnail: null } : {}),
      },
    }),
  ]);

  await deleteProductMediaIfOrphaned([image.url]);
  return image;
};