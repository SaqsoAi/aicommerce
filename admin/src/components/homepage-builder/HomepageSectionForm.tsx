'use client';

import { useState } from 'react';

import type { HomepageSectionPayload } from '@/services/homepage-section.service';

const sectionTypes = [
  'HERO',
  'ANNOUNCEMENT',
  'TRUST_BADGES',
  'FEATURED_CATEGORIES',
  'FEATURED_PRODUCTS',
  'NEW_ARRIVALS',
  'BEST_SELLERS',
  'TRENDING',
  'PROMO_BANNER',
  'NEWSLETTER',
  'CUSTOM_HTML',
];

type Props = {
  onSubmit: (data: HomepageSectionPayload) => Promise<void>;
};

export default function HomepageSectionForm({
  onSubmit,
}: Props) {
  const [form, setForm] = useState<HomepageSectionPayload>({
    title: '',
    slug: '',
    type: 'HERO',
    enabled: true,
    sortOrder: 0,
    data: {},
  });

  const [jsonData, setJsonData] = useState('{}');

  const [saving, setSaving] = useState(false);
  const data = (() => { try { return JSON.parse(jsonData || '{}') as Record<string, any>; } catch { return {}; } })();
  const updateData = (key: string, value: string) => setJsonData(JSON.stringify({ ...data, [key]: value }, null, 2));

  const updateField = (
    key: keyof HomepageSectionPayload,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      let parsedData = {};

      try {
        parsedData = JSON.parse(jsonData || '{}');
      } catch {
        alert('Invalid JSON data');
        return;
      }

      await onSubmit({
        ...form,
        data: parsedData,
        sortOrder: Number(form.sortOrder || 0),
      });

      setForm({
        title: '',
        slug: '',
        type: 'HERO',
        enabled: true,
        sortOrder: 0,
        data: {},
      });

      setJsonData('{}');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <h2 className='text-xl font-bold'>
        Create Homepage Section
      </h2>

      <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <input
          value={form.title}
          onChange={(e) =>
            updateField('title', e.target.value)
          }
          placeholder='Section Title'
          className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
        />

        <input
          value={form.slug}
          onChange={(e) =>
            updateField('slug', e.target.value)
          }
          placeholder='section-slug'
          className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
        />

        <select
          value={form.type}
          onChange={(e) =>
            updateField('type', e.target.value)
          }
          className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
        >
          {sectionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type='number'
          value={form.sortOrder}
          onChange={(e) =>
            updateField('sortOrder', Number(e.target.value))
          }
          placeholder='Sort Order'
          className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
        />
      </div>

      <label className='mt-4 flex items-center gap-2'>
        <input
          type='checkbox'
          checked={Boolean(form.enabled)}
          onChange={(e) =>
            updateField('enabled', e.target.checked)
          }
        />
        Enabled
      </label>

      <div className='mt-5 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700'>
        <div className='mb-3'>
          <h3 className='font-bold'>Customer-facing content</h3>
          <p className='text-sm text-zinc-500'>These fields update the storefront without editing JSON.</p>
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='grid gap-1 text-sm font-medium'>Headline<input value={String(data.headline || '')} onChange={(e)=>updateData('headline',e.target.value)} className='min-h-11 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-700' placeholder='Section headline'/></label>
          <label className='grid gap-1 text-sm font-medium'>Eyebrow<input value={String(data.eyebrow || '')} onChange={(e)=>updateData('eyebrow',e.target.value)} className='min-h-11 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-700' placeholder='Small label'/></label>
          <label className='grid gap-1 text-sm font-medium md:col-span-2'>Description<textarea value={String(data.description || '')} onChange={(e)=>updateData('description',e.target.value)} className='min-h-24 rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700' placeholder='Customer-facing description'/></label>
          <label className='grid gap-1 text-sm font-medium'>Button text<input value={String(data.ctaLabel || '')} onChange={(e)=>updateData('ctaLabel',e.target.value)} className='min-h-11 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-700' placeholder='Shop now'/></label>
          <label className='grid gap-1 text-sm font-medium'>Button link<input value={String(data.ctaHref || '')} onChange={(e)=>updateData('ctaHref',e.target.value)} className='min-h-11 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-700' placeholder='/shop'/></label>
          <label className='grid gap-1 text-sm font-medium md:col-span-2'>Image URL<input value={String(data.imageUrl || '')} onChange={(e)=>updateData('imageUrl',e.target.value)} className='min-h-11 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-700' placeholder='/uploads/homepage/...'/></label>
        </div>
      </div>

      <details className='mt-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700'><summary className='cursor-pointer font-bold'>Advanced JSON</summary><textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder='Section JSON data'
        className='mt-3 h-36 w-full rounded-xl border border-zinc-200 bg-transparent p-3 font-mono text-sm dark:border-zinc-700'
      /></details>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className='mt-5 rounded-xl bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
      >
        {saving ? 'Saving...' : 'Create Section'}
      </button>
    </div>
  );
}
