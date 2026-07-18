import fal from "../config/fal";

export type FalTryOnOutput = {
  image?: {
    url?: string;
  };
  images?: Array<{
    url?: string;
  }>;
};

export const runVirtualTryOn = async (
  personImage: string,
  garmentImage: string
): Promise<string> => {
  const result = await fal.subscribe("fal-ai/fashn/tryon", {
    input: {
      model_image: personImage,
      garment_image: garmentImage,
    },
  });

  const data = result.data as FalTryOnOutput;

  const imageUrl =
    data?.image?.url ||
    data?.images?.[0]?.url;

  if (!imageUrl) {
    throw new Error("fal.ai FASHN Try-On did not return a result image.");
  }

  return imageUrl;
};
