import {
  getStoreSettings,
} from '@/services/store-settings.service';

export default async function StoreFooter() {
  const settings =
    await getStoreSettings();

  return (
    <footer className='border-t bg-zinc-950 px-6 py-12 text-white'>
      <div className='mx-auto grid max-w-7xl gap-8 md:grid-cols-3'>
        <div>
          <h3 className='text-2xl font-bold'>
            {settings?.storeName || 'AI Commerce'}
          </h3>

          <p className='mt-3 text-zinc-400'>
            {settings?.aboutText ||
              'Premium AI powered ecommerce store.'}
          </p>
        </div>

        <div>
          <h4 className='font-semibold'>
            Contact
          </h4>

          <div className='mt-3 space-y-2 text-zinc-400'>
            <p>{settings?.phone || ''}</p>
            <p>{settings?.email || ''}</p>
            <p>{settings?.address || ''}</p>
          </div>
        </div>

        <div>
          <h4 className='font-semibold'>
            Social
          </h4>

          <div className='mt-3 space-y-2 text-zinc-400'>
            {settings?.facebookUrl && (
              <p>Facebook: {settings.facebookUrl}</p>
            )}
            {settings?.instagramUrl && (
              <p>Instagram: {settings.instagramUrl}</p>
            )}
            {settings?.tiktokUrl && (
              <p>TikTok: {settings.tiktokUrl}</p>
            )}
            {settings?.youtubeUrl && (
              <p>YouTube: {settings.youtubeUrl}</p>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto mt-10 max-w-7xl border-t border-zinc-800 pt-6 text-sm text-zinc-500'>
        {settings?.footerText ||
          '© AI Commerce. All rights reserved.'}
      </div>
    </footer>
  );
}


