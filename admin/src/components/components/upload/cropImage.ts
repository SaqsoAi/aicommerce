export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function createCroppedImage(
  imageSrc: string,
  crop: PixelCrop,
  outputWidth: number,
  outputHeight: number,
  fileName = "cropped.webp"
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error("Crop failed"));
        else resolve(result);
      },
      "image/webp",
      0.92
    );
  });

  return new File([blob], fileName, {
    type: "image/webp",
  });
}
