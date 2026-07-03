import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const lookupBarcode =
  async (
    barcode: string
  ) => {
    const response =
      await axios.get(
        `${API_URL}/integration-engine/barcode/${barcode}`
      );

    return response.data;
  };

export const lookupStyle =
  async (
    styleNo: string
  ) => {
    const response =
      await axios.get(
        `${API_URL}/integration-engine/style/${styleNo}`
      );

    return response.data;
  };

export const autoFillBarcode =
  async (
    barcode: string
  ) => {
    const response =
      await axios.get(
        `${API_URL}/integration-engine/auto-fill/barcode/${barcode}`
      );

    return response.data;
  };

export const autoFillStyle =
  async (
    styleNo: string
  ) => {
    const response =
      await axios.get(
        `${API_URL}/integration-engine/auto-fill/style/${styleNo}`
      );

    return response.data;
  };