"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createLandingPage,
  getLandingPage,
  updateLandingPage,
  type LandingPage,
  type LandingSection,
} from "@/api/landing.api";

const defaultSections: LandingSection[] = [
  {
    type: "hero",
    title: "Campaign Hero",
    subtitle: "Premium landing hero section",
    sortOrder: 0,
    configJson: {
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image: "",
    },
  },
  {
    type: "product-grid",
    title: "Featured Products",
    subtitle: "Campaign connected product collection",
    sortOrder: 1,
    configJson: {
      source: "campaign",
      limit: 8,
    },
  },
];

export default function LandingForm({ id }: { id: string }) {
  const router = useRouter();
  const isNew = id === "new";

  const [form, setForm] = useState<Partial<LandingPage>>({
    name: "",
    slug: "",
    title: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    template: "fashion",
    campaignId: "",
    sections: defaultSections,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;

    getLandingPage(id)
      .then((data) => setForm(data))
      .catch(() => {});
  }, [id, isNew]);

  function setField(name: keyof LandingPage, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setSection(index: number, key: keyof LandingSection, value: string) {
    setForm((prev) => {
      const sections = [...(prev.sections || [])];
      sections[index] = { ...sections[index], [key]: value };
      return { ...prev, sections };
    });
  }

  function addSection() {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          type: "content",
          title: "New Section",
          subtitle: "",
          sortOrder: prev.sections?.length || 0,
          configJson: {},
        },
      ],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      name: form.name || form.title || "Untitled Landing",
      slug:
        form.slug ||
        String(form.name || form.title || "landing")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      title: form.title || form.name || "Landing Page",
      sections: (form.sections || []).map((section, index) => ({
        ...section,
        sortOrder: index,
      })),
    };

    if (isNew) {
      const created = await createLandingPage(payload);
      router.push(`/landing-builder/${created.id}/edit`);
    } else {
      await updateLandingPage(id, payload);
      router.refresh();
    }

    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <h2 className="mb-4 text-xl font-semibold">Landing Builder</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Landing Name</span>
              <input className="rounded-xl border p-3" value={form.name || ""} onChange={(e) => setField("name", e.target.value)} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Slug</span>
              <input className="rounded-xl border p-3" value={form.slug || ""} onChange={(e) => setField("slug", e.target.value)} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Campaign ID</span>
              <input className="rounded-xl border p-3" value={form.campaignId || ""} onChange={(e) => setField("campaignId", e.target.value)} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Template</span>
              <select className="rounded-xl border p-3" value={form.template || "fashion"} onChange={(e) => setField("template", e.target.value)}>
                <option value="fashion">Fashion</option>
                <option value="luxury">Luxury</option>
                <option value="modern">Modern</option>
              </select>
            </label>
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-medium">Title</span>
            <input className="rounded-xl border p-3" value={form.title || ""} onChange={(e) => setField("title", e.target.value)} />
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-medium">Description</span>
            <textarea className="min-h-28 rounded-xl border p-3" value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
          </label>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sections</h2>
            <button type="button" onClick={addSection} className="rounded-xl border px-4 py-2 text-sm">
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {(form.sections || []).map((section, index) => (
              <div key={index} className="rounded-xl border p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Type</span>
                    <select className="rounded-xl border p-3" value={section.type} onChange={(e) => setSection(index, "type", e.target.value)}>
                      <option value="hero">Hero</option>
                      <option value="content">Content</option>
                      <option value="product-grid">Product Grid</option>
                      <option value="campaign-banner">Campaign Banner</option>
                      <option value="cta">CTA</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Title</span>
                    <input className="rounded-xl border p-3" value={section.title || ""} onChange={(e) => setSection(index, "title", e.target.value)} />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Subtitle</span>
                    <input className="rounded-xl border p-3" value={section.subtitle || ""} onChange={(e) => setSection(index, "subtitle", e.target.value)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <h2 className="mb-4 text-xl font-semibold">SEO</h2>

          <label className="grid gap-2">
            <span className="text-sm font-medium">SEO Title</span>
            <input className="rounded-xl border p-3" value={form.seoTitle || ""} onChange={(e) => setField("seoTitle", e.target.value)} />
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-medium">SEO Description</span>
            <textarea className="min-h-24 rounded-xl border p-3" value={form.seoDescription || ""} onChange={(e) => setField("seoDescription", e.target.value)} />
          </label>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-medium">SEO Keywords</span>
            <input className="rounded-xl border p-3" value={form.seoKeywords || ""} onChange={(e) => setField("seoKeywords", e.target.value)} />
          </label>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-950">
          <button disabled={saving} className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black">
            {saving ? "Saving..." : "Save Landing"}
          </button>
        </div>
      </aside>
    </form>
  );
}
