"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useEffect, useMemo, useState } from "react";
import {
  createHomepageSection,
  deleteHomepageSection,
  getHomepageSections,
  reorderHomepageSections,
  toggleHomepageSection,
  type HomepageSection,
} from "@/services/homepage-section.service";

const SECTION_TYPES = [
  "PERSONALIZATION_BANNER",
  "FEATURED_CATEGORIES",
  "TRENDING_COLLECTIONS",
  "FLASH_SALE",
  "RECOMMENDATION_ENGINE",
  "SOCIAL_FEEDS",
  "NEWSLETTER",
  "AI_MEMBERSHIP_BANNER",
  "MEMBERSHIP_BANNER",
  "SUSTAINABILITY_BLOCK",
];

const SKIP_HERO_TYPES = ["HERO", "HOMEPAGE_HERO", "BANNER", "SLIDER"];

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(SECTION_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [sections]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getHomepageSections();
      setSections(data);
    } catch (error) {
      console.error(error);
      alert("Homepage sections load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const autoSaveOrder = async (nextSections: HomepageSection[]) => {
    try {
      setSaving(true);
      setSections(nextSections);
      await reorderHomepageSections(nextSections);
      await loadSections();
    } catch (error) {
      console.error(error);
      alert("Auto save reorder failed");
    } finally {
      setSaving(false);
    }
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const next = [...orderedSections];
    const target = direction === "up" ? index - 1 : index + 1;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    const normalized = next.map((item, i) => ({
      ...item,
      sortOrder: i + 1,
    }));

    await autoSaveOrder(normalized);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    event.preventDefault();

    const dragIndex = Number(event.dataTransfer.getData("text/plain"));

    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;

    const next = [...orderedSections];
    const [removed] = next.splice(dragIndex, 1);

    next.splice(dropIndex, 0, removed);

    const normalized = next.map((item, i) => ({
      ...item,
      sortOrder: i + 1,
    }));

    await autoSaveOrder(normalized);
  };

  const createSection = async () => {
    if (!title.trim()) {
      alert("Section title required");
      return;
    }

    try {
      setSaving(true);

      await createHomepageSection({
        title,
        slug: makeSlug(title),
        type,
        enabled: true,
        sortOrder: orderedSections.length + 1,
        data: {},
      });

      setTitle("");
      setType(SECTION_TYPES[0]);
      await loadSections();
    } catch (error) {
      console.error(error);
      alert("Create section failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = async (id: string) => {
    try {
      setSaving(true);
      await toggleHomepageSection(id);
      await loadSections();
    } catch (error) {
      console.error(error);
      alert("Toggle failed");
    } finally {
      setSaving(false);
    }
  };

  const removeSection = async (id: string) => {
    if (!confirm("Delete this section?")) return;

    try {
      setSaving(true);
      await deleteHomepageSection(id);
      await loadSections();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout><div className="min-h-screen rounded-3xl bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
              SAQSO Visual Builder
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Homepage Builder Final
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Drag, reorder, enable, disable and auto-save homepage sections.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm">
            {saving ? "Auto saving..." : "Auto Save Ready"}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-black">Add Section</h2>

              <div className="mt-5 space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Section title"
                  className="w-full rounded-xl border border-white/10 bg-black p-3"
                />

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black p-3"
                >
                  {SECTION_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createSection}
                  disabled={saving}
                  className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-50"
                >
                  Create Section
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-black">Builder Rules</h2>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <p>Hero is rendered only by Homepage Hero Builder.</p>
                <p>HomepageSectionRenderer must skip HERO, HOMEPAGE_HERO, BANNER, SLIDER.</p>
                <p>Drag or use Move buttons. Order auto saves.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black">Homepage Layout</h2>
                <button
                  onClick={loadSections}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-zinc-400">Loading sections...</p>
              ) : null}

              <div className="space-y-3">
                {orderedSections.map((section, index) => {
                  const isHeroType = SKIP_HERO_TYPES.includes(section.type);

                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, index)}
                      className={`rounded-2xl border p-4 transition ${
                        section.enabled
                          ? "border-white/15 bg-black"
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                            #{index + 1} / {section.type}
                          </p>

                          <h3 className="mt-1 text-lg font-black">
                            {section.title}
                          </h3>

                          <p className="text-sm text-zinc-500">
                            slug: {section.slug}
                          </p>

                          {isHeroType ? (
                            <p className="mt-2 text-xs font-bold text-yellow-400">
                              Skipped in section renderer. Hero comes from Homepage Hero Builder.
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => moveSection(index, "up")}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
                          >
                            Up
                          </button>

                          <button
                            onClick={() => moveSection(index, "down")}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
                          >
                            Down
                          </button>

                          <button
                            onClick={() => toggleSection(section.id)}
                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                              section.enabled
                                ? "bg-green-500 text-black"
                                : "bg-zinc-700 text-white"
                            }`}
                          >
                            {section.enabled ? "Enabled" : "Disabled"}
                          </button>

                          <button
                            onClick={() => removeSection(section.id)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!orderedSections.length && !loading ? (
                  <p className="rounded-2xl border border-white/10 bg-black p-6 text-zinc-400">
                    No sections found. Create your first homepage section.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black p-5">
              <h2 className="text-xl font-black">Live Preview</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Client-like visual order preview.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white text-black">
                <div className="bg-zinc-950 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">
                    Hero
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Homepage Hero Builder
                  </h3>
                  <p className="text-sm text-white/60">
                    Rendered by /homepage-hero only.
                  </p>
                </div>

                {orderedSections
                  .filter((item) => item.enabled)
                  .filter((item) => !SKIP_HERO_TYPES.includes(item.type))
                  .map((item) => (
                    <div key={item.id} className="border-b p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                        {item.type}
                      </p>
                      <h4 className="mt-1 text-lg font-black">
                        {item.title}
                      </h4>
                    </div>
                  ))}

                <div className="bg-black p-5 text-white">
                  <h4 className="font-black">Footer</h4>
                  <p className="text-sm text-white/50">
                    Saqso premium footer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          PHASE 4.10.3.5 - Homepage Builder Final
        </p>
      </div>
    </div></DashboardLayout>
  );
}



