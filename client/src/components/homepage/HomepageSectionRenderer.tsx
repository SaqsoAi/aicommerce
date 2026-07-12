"use client";
import { getHomepageSectionDefinition } from "@/components/homepage/homepage-section-registry";
import type { HomepageRuntimeSection } from "@/types/homepage-runtime";

type Props = { sections: HomepageRuntimeSection[]; preview?: boolean };

export default function HomepageSectionRenderer({ sections, preview = false }: Props) {
  const visible = [...sections].filter((section) => section.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  return <>
    {visible.map((section) => {
      const definition = getHomepageSectionDefinition(section.key);
      if (!definition?.renderer) return preview ? <section key={section.id} className="mx-auto max-w-7xl px-6 py-8" role="status"><div className="rounded-2xl border border-dashed border-zinc-400 p-6 text-sm">Unsupported homepage section: {section.rawKey}</div></section> : null;
      const configResult = definition.validateConfig(section.config);
      const dataResult = definition.validateData(section.data);
      if (!configResult.success || !dataResult.success) return preview ? <section key={section.id} className="mx-auto max-w-7xl px-6 py-8" role="status"><div className="rounded-2xl border border-dashed border-zinc-400 p-6 text-sm">Invalid configuration for {definition.label}</div></section> : null;
      const Renderer = definition.renderer;
      return <Renderer key={section.id} section={section} />;
    })}
  </>;
}
