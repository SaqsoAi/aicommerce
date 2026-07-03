'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  getStoreSettings,
  updateStoreSettings,
  uploadStoreLogo,
  type StoreSettingsPayload,
} from '@/services/store-settings.service';

export default function StoreSettingsForm() {
  const [form, setForm] =
    useState<StoreSettingsPayload>({
      storeName: '',
      storeTagline: '',
      logoUrl: '',
      faviconUrl: '',
      primaryColor: '#111827',
      secondaryColor: '#6D28D9',
      phone: '',
      email: '',
      address: '',
      aboutTitle: '',
      aboutText: '',
      footerText: '',
      facebookUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const updateField = (
    key: keyof StoreSettingsPayload,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadData =
    async () => {
      try {
        const data =
          await getStoreSettings();

        setForm({
          storeName: data.storeName || '',
          storeTagline: data.storeTagline || '',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          primaryColor: data.primaryColor || '#111827',
          secondaryColor: data.secondaryColor || '#6D28D9',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          aboutTitle: data.aboutTitle || '',
          aboutText: data.aboutText || '',
          footerText: data.footerText || '',
          facebookUrl: data.facebookUrl || '',
          instagramUrl: data.instagramUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          youtubeUrl: data.youtubeUrl || '',
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogoUpload =
    async (
      file?: File
    ) => {
      if (!file) return;

      const result =
        await uploadStoreLogo(
          file
        );

      updateField(
        'logoUrl',
        result.logoUrl
      );
    };

  const handleSave =
    async () => {
      try {
        setSaving(true);

        await updateStoreSettings(
          form
        );

        alert(
          'Store settings updated'
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className='text-zinc-500'>
        Loading settings...
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='text-xl font-bold'>
          Store Identity
        </h2>

        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          <input
            value={form.storeName}
            onChange={(e) =>
              updateField(
                'storeName',
                e.target.value
              )
            }
            placeholder='Store Name'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />

          <input
            value={form.storeTagline}
            onChange={(e) =>
              updateField(
                'storeTagline',
                e.target.value
              )
            }
            placeholder='Store Tagline'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />
        </div>

        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          <input
            type='file'
            accept='image/*'
            onChange={(e) =>
              handleLogoUpload(
                e.target.files?.[0]
              )
            }
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />

          <input
            value={form.logoUrl}
            onChange={(e) =>
              updateField(
                'logoUrl',
                e.target.value
              )
            }
            placeholder='Logo URL'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />
        </div>

        {form.logoUrl && (
          <img
            src={form.logoUrl}
            alt='Store Logo'
            className='mt-5 h-20 rounded-xl border border-zinc-200 object-contain p-2 dark:border-zinc-800'
          />
        )}
      </div>

      <div className='rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='text-xl font-bold'>
          Contact & Footer
        </h2>

        <div className='mt-5 grid gap-4 md:grid-cols-3'>
          <input
            value={form.phone}
            onChange={(e) =>
              updateField(
                'phone',
                e.target.value
              )
            }
            placeholder='Phone'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />

          <input
            value={form.email}
            onChange={(e) =>
              updateField(
                'email',
                e.target.value
              )
            }
            placeholder='Email'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />

          <input
            value={form.address}
            onChange={(e) =>
              updateField(
                'address',
                e.target.value
              )
            }
            placeholder='Address'
            className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />
        </div>

        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          <textarea
            value={form.aboutText}
            onChange={(e) =>
              updateField(
                'aboutText',
                e.target.value
              )
            }
            placeholder='About Store'
            className='h-32 rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />

          <textarea
            value={form.footerText}
            onChange={(e) =>
              updateField(
                'footerText',
                e.target.value
              )
            }
            placeholder='Footer Text'
            className='h-32 rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
          />
        </div>
      </div>

      <div className='rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='text-xl font-bold'>
          Social Links
        </h2>

        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          {[
            'facebookUrl',
            'instagramUrl',
            'tiktokUrl',
            'youtubeUrl',
          ].map((key) => (
            <input
              key={key}
              value={
                form[
                  key as keyof StoreSettingsPayload
                ] || ''
              }
              onChange={(e) =>
                updateField(
                  key as keyof StoreSettingsPayload,
                  e.target.value
                )
              }
              placeholder={key}
              className='rounded-xl border border-zinc-200 bg-transparent p-3 dark:border-zinc-700'
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className='rounded-xl bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
      >
        {saving
          ? 'Saving...'
          : 'Save Store Settings'}
      </button>
    </div>
  );
}
