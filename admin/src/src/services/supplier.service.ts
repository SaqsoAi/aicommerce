import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export type SupplierPayload = {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  notes?: string;
};

export const getSuppliers = async () => {
  const res = await axios.get(`${API}/suppliers`);
  return res.data.data;
};

export const createSupplier = async (
  data: SupplierPayload
) => {
  const res = await axios.post(
    `${API}/suppliers`,
    data
  );

  return res.data;
};

export const updateSupplier = async (
  id: string,
  data: SupplierPayload
) => {
  const res = await axios.put(
    `${API}/suppliers/${id}`,
    data
  );

  return res.data;
};

export const deleteSupplier = async (
  id: string
) => {
  const res = await axios.delete(
    `${API}/suppliers/${id}`
  );

  return res.data;
};
