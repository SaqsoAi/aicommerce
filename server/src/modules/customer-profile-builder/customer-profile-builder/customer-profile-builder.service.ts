import prisma from "../../config/prisma";

export const getCustomerProfileFieldsService = async () => {
  return prisma.customerProfileField.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const createCustomerProfileFieldService = async (data: any) => {
  return prisma.customerProfileField.create({
    data: {
      name: data.name,
      label: data.label,
      type: data.type || "TEXT",
      placeholder: data.placeholder || null,
      required: Boolean(data.required),
      visible: data.visible ?? true,
      enabled: data.enabled ?? true,
      sortOrder: Number(data.sortOrder ?? 0),
    },
  });
};

export const updateCustomerProfileFieldService = async (
  id: string,
  data: any
) => {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.placeholder !== undefined) updateData.placeholder = data.placeholder;
  if (data.required !== undefined) updateData.required = Boolean(data.required);
  if (data.visible !== undefined) updateData.visible = Boolean(data.visible);
  if (data.enabled !== undefined) updateData.enabled = Boolean(data.enabled);
  if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

  return prisma.customerProfileField.update({
    where: {
      id,
    },
    data: updateData,
  });
};

export const deleteCustomerProfileFieldService = async (id: string) => {
  return prisma.customerProfileField.delete({
    where: {
      id,
    },
  });
};
