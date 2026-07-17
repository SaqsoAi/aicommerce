import { Request, Response } from "express";

import {
  getCustomerProfileFieldsService,
  createCustomerProfileFieldService,
  updateCustomerProfileFieldService,
  deleteCustomerProfileFieldService,
} from "./customer-profile-builder.service";

export const getCustomerProfileFields = async (
  req: Request,
  res: Response
) => {
  try {
    const fields = await getCustomerProfileFieldsService();

    return res.json({
      success: true,
      data: fields,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile fields",
    });
  }
};

export const createCustomerProfileField = async (
  req: Request,
  res: Response
) => {
  try {
    const field = await createCustomerProfileFieldService(req.body);

    return res.status(201).json({
      success: true,
      data: field,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create profile field",
    });
  }
};

export const updateCustomerProfileField = async (
  req: Request,
  res: Response
) => {
  try {
    const field = await updateCustomerProfileFieldService(
      String(req.params.id),
      req.body
    );

    return res.json({
      success: true,
      data: field,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile field",
    });
  }
};

export const deleteCustomerProfileField = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteCustomerProfileFieldService(String(req.params.id));

    return res.json({
      success: true,
      message: "Profile field deleted",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete profile field",
    });
  }
};
