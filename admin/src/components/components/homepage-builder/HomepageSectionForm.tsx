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

      <textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder='Section JSON data'
        className='mt-4 h-36 w-full rounded-xl border border-zinc-200 bg-transparent p-3 font-mono text-sm dark:border-zinc-700'
      />

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
