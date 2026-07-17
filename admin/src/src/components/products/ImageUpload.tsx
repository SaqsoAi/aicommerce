"use client";

import { useState } from "react";

export type GalleryItem = {
  file: File;
  isThumbnail: boolean;
};

type Props = {
  images: GalleryItem[];
  setImages: (
    images: GalleryItem[]
  ) => void;

  video: File | null;

  setVideo: (
    video: File | null
  ) => void;
};

export default function ImageUpload({
  images,
  setImages,
  video,
  setVideo,
}: Props) {
  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:file:bg-zinc-100 dark:file:text-zinc-900";

  const handleImages = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (
      images.length + files.length >
      10
    ) {
      alert(
        "Maximum 10 images allowed"
      );
      return;
    }

    const newImages =
      files.map((file) => ({
        file,
        isThumbnail: false,
      }));

    setImages([
      ...images,
      ...newImages,
    ]);
  };

  const removeImage = (
    index: number
  ) => {
    setImages(
      images.filter(
        (_, i) => i !== index
      )
    );
  };

  const setThumbnail = (
    index: number
  ) => {
    setImages(
      images.map(
        (image, i) => ({
          ...image,
          isThumbnail:
            i === index,
        })
      )
    );
  };

  const handleVideo = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setVideo(file);
  };

  return (
    <div className="space-y-8 text-zinc-900 dark:text-zinc-100">
      <div>
        <label className="block font-semibold mb-3">
          Product Images
        </label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImages}
          className={inputClass}
        />
      </div>

      {images.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">
            Gallery Preview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(
              (
                image,
                index
              ) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <img
                    src={URL.createObjectURL(
                      image.file
                    )}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />

                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setThumbnail(
                          index
                        )
                      }
                      className={`rounded px-2 py-1 text-sm ${
                        image.isThumbnail
                          ? "bg-green-600 text-white"
                          : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      }`}
                    >
                      {image.isThumbnail
                        ? "Thumbnail"
                        : "Set Thumbnail"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="bg-red-600 text-white rounded px-2 py-1 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block font-semibold mb-3">
          Product Video
        </label>

        <input
          type="file"
          accept="video/*"
          onChange={handleVideo}
          className={inputClass}
        />
      </div>

      {video && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-semibold mb-2">
            Video Preview
          </h3>

          <video
            controls
            className="w-full rounded"
            src={URL.createObjectURL(
              video
            )}
          />
        </div>
      )}
    </div>
  );
}
