import axios from 'axios';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

export type StoreSettingsPayload = {
  storeName?: string;
  storeTagline?: string;
  logoUrl?: string;
  faviconUrl?: string;

  primaryColor?: string;
  secondaryColor?: string;

  phone?: string;
  email?: string;
  address?: string;

  aboutTitle?: string;
  aboutText?: string;
  footerText?: string;

  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
};

export const getStoreSettings =
  async () => {
    const res =
      await axios.get(
        `${API}/store-settings`
      );

    return res.data.data;
  };

export const updateStoreSettings =
  async (
    data: StoreSettingsPayload
  ) => {
    const res =
      await axios.put(
        `${API}/store-settings`,
        data
      );

    return res.data;
  };

export const uploadStoreLogo =
  async (
    file: File
  ) => {
    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    const res =
      await axios.post(
        `${API}/store-settings/logo`,
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

    return res.data;
  };

export const updateStoreThemeSettings = async (payload: {
  themeMode?: string;
  headerStyle?: string;
  heroStyle?: string;
  buttonStyle?: string;
  footerStyle?: string;
  activeTemplate?: string;
}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Theme settings update failed");
  }

  return data;
};
