"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Hero } from "./types";

type Props = {
  hero?: Hero;
  isEdit?: boolean;
  onSuccess?: () => void;
};

type HeroFormData = {
  title: string;
  subtitle: string;
  image: string;
  video: string;
  type: string;
  buttonText: string;
  buttonLink: string;
  secondaryText: string;
  secondaryLink: string;
  endDate: string;
};

export default function HeroForm({
  hero,
  isEdit = false,
  onSuccess,
}: Props) {
  const router = useRouter();

  const API =
    process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState<HeroFormData>({
      title: "",
      subtitle: "",
      image: "",
      video: "",
      type: "slider",
      buttonText: "",
      buttonLink: "",
      secondaryText: "",
      secondaryLink: "",
      endDate: "",
    });

  // ================= LOAD EDIT DATA =================

  useEffect(() => {
    if (!hero) return;

    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      image: hero.image || "",
      video: hero.video || "",
      type: hero.type || "slider",
      buttonText: hero.buttonText || "",
      buttonLink: hero.buttonLink || "",
      secondaryText:
        hero.secondaryText || "",
      secondaryLink:
        hero.secondaryLink || "",
      endDate: hero.endDate || "",
    });
  }, [hero]);

  // ================= IMAGE UPLOAD =================

  const handleImageUpload = async (
    file: File
  ) => {
    try {
      const fd = new FormData();

      fd.append("file", file);

      const res = await fetch(
        `${API}/media/upload`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data =
        await res.json();

      setForm((prev) => ({
        ...prev,
        image:
          data.url ||
          data.data?.url ||
          "",
      }));
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }
  };

  // ================= VIDEO UPLOAD =================

  const handleVideoUpload = async (
    file: File
  ) => {
    try {
      const fd = new FormData();

      fd.append("file", file);

      const res = await fetch(
        `${API}/media/upload`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data =
        await res.json();

      setForm((prev) => ({
        ...prev,
        video:
          data.url ||
          data.data?.url ||
          "",
      }));
    } catch (error) {
      console.error(error);
      alert("Video upload failed");
    }
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        alert("Hero title required");
        return;
      }

      setLoading(true);

      const url =
        isEdit && hero
          ? `${API}/heroes/${hero.id}`
          : `${API}/heroes`;

      const method =
        isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      });

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Request failed"
        );
      }

      alert(
        isEdit
          ? "Hero updated successfully"
          : "Hero created successfully"
      );

      if (isEdit) {
        router.push("/heroes");
        return;
      }

      setForm({
        title: "",
        subtitle: "",
        image: "",
        video: "",
        type: "slider",
        buttonText: "",
        buttonLink: "",
        secondaryText: "",
        secondaryLink: "",
        endDate: "",
      });

      onSuccess?.();
    } catch (error: any) {
      alert(
        error.message ||
          "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-5">
        {isEdit
          ? "Edit Hero"
          : "Create Hero"}
      </h2>

      <div className="grid gap-4">
        <input
          className="border p-3 rounded"
          placeholder="Hero Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title:
                e.target.value,
            })
          }
        />

        <textarea
          className="border p-3 rounded"
          rows={4}
          placeholder="Hero Subtitle"
          value={form.subtitle}
          onChange={(e) =>
            setForm({
              ...form,
              subtitle:
                e.target.value,
            })
          }
        />

        {/* IMAGE */}

        <div>
          <label className="block font-medium mb-2">
            Hero Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                handleImageUpload(
                  file
                );
              }
            }}
          />

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="w-48 mt-3 rounded border"
            />
          )}
        </div>

        {/* VIDEO */}

        <div>
          <label className="block font-medium mb-2">
            Hero Video
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                handleVideoUpload(
                  file
                );
              }
            }}
          />

          {form.video && (
            <p className="text-green-600">
              Video Uploaded
            </p>
          )}
        </div>

        <select
          className="border p-3 rounded"
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type:
                e.target.value,
            })
          }
        >
          <option value="slider">
            Slider Hero
          </option>

          <option value="banner">
            Banner Hero
          </option>

          <option value="video">
            Video Hero
          </option>

          <option value="countdown">
            Countdown Hero
          </option>
        </select>

        <input
          className="border p-3 rounded"
          placeholder="Primary Button Text"
          value={form.buttonText}
          onChange={(e) =>
            setForm({
              ...form,
              buttonText:
                e.target.value,
            })
          }
        />

        <input
          className="border p-3 rounded"
          placeholder="Primary Button Link"
          value={form.buttonLink}
          onChange={(e) =>
            setForm({
              ...form,
              buttonLink:
                e.target.value,
            })
          }
        />

        <input
          className="border p-3 rounded"
          placeholder="Secondary Button Text"
          value={form.secondaryText}
          onChange={(e) =>
            setForm({
              ...form,
              secondaryText:
                e.target.value,
            })
          }
        />

        <input
          className="border p-3 rounded"
          placeholder="Secondary Button Link"
          value={form.secondaryLink}
          onChange={(e) =>
            setForm({
              ...form,
              secondaryLink:
                e.target.value,
            })
          }
        />

        {form.type ===
          "countdown" && (
          <input
            type="datetime-local"
            className="border p-3 rounded"
            value={form.endDate}
            onChange={(e) =>
              setForm({
                ...form,
                endDate:
                  e.target.value,
              })
            }
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white py-3 rounded"
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Save Changes"
            : "Create Hero"}
        </button>
      </div>
    </div>
  );
}