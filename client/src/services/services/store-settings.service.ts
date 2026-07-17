const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

export const getStoreSettings =
  async () => {
    try {
      const res =
        await fetch(
          `${API}/store-settings`,
          {
            cache: 'no-store',
          }
        );

      const json =
        await res.json();

      return json.data;
    } catch {
      return {
        storeName: 'AI Commerce',
        logoUrl: '',
        footerText:
          '© AI Commerce. All rights reserved.',
      };
    }
  };
