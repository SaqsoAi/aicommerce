import {
  getStoreSettings,
} from '@/services/store-settings.service';

export default async function StoreLogo() {
  const settings =
    await getStoreSettings();

  if (settings?.logoUrl) {
    return (
      <img
        src={settings.logoUrl}
        alt={settings.storeName || 'Store Logo'}
        className='h-10 object-contain'
      />
    );
  }

  return (
    <div className='text-xl font-bold'>
      {settings?.storeName || 'AI Commerce'}
    </div>
  );
}


