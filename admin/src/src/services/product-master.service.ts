import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const fetchProductMaster =
  async (
    barcode?: string,
    styleCode?: string
  ) => {
    const res =
      await axios.post(
        `${API}/product-master/fetch`,
        {
          barcode,
          styleCode,
        }
      );

    return res.data;
  };

export const generateProductCodes =
  async () => {
    const res =
      await axios.get(
        `${API}/product-code/generate`
      );

    return res.data;
  };