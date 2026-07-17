import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export type CustomerProfileFieldPayload = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  sortOrder?: number;
};

export const getCustomerProfileFields =
  async () => {
    const res =
      await axios.get(
        `${API}/customer-profile-fields`
      );

    return res.data.data;
  };

export const createCustomerProfileField =
  async (
    data: CustomerProfileFieldPayload
  ) => {
    const res =
      await axios.post(
        `${API}/customer-profile-fields`,
        data
      );

    return res.data;
  };

export const updateCustomerProfileField =
  async (
    id: string,
    data: Partial<CustomerProfileFieldPayload>
  ) => {
    const res =
      await axios.put(
        `${API}/customer-profile-fields/${id}`,
        data
      );

    return res.data;
  };

export const deleteCustomerProfileField =
  async (
    id: string
  ) => {
    const res =
      await axios.delete(
        `${API}/customer-profile-fields/${id}`
      );

    return res.data;
  };
