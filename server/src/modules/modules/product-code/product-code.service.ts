import prisma from "../../config/prisma";

const pad = (
  value: number
) => {
  return value
    .toString()
    .padStart(6, "0");
};

export const generateCodesService =
  async () => {
    let settings =
      await prisma.productCodeSettings.findFirst();

    if (!settings) {
      settings =
        await prisma.productCodeSettings.create({
          data: {},
        });
    }

    const barcode =
      `${settings.barcodePrefix}${pad(
        settings.barcodeCounter
      )}`;

    const styleCode =
      `${settings.stylePrefix}-${pad(
        settings.styleCounter
      )}`;

    await prisma.productCodeSettings.update({
      where: {
        id: settings.id,
      },

      data: {
        barcodeCounter: {
          increment: 1,
        },

        styleCounter: {
          increment: 1,
        },
      },
    });

    return {
      barcode,
      styleCode,
    };
  };