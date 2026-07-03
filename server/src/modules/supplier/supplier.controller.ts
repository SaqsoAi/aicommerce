import {
  Request,
  Response,
} from "express";

import {
  createSupplierService,
  getSuppliersService,
  updateSupplierService,
  deleteSupplierService,
} from "./supplier.service";

import {
  supplierSchema,
} from "./supplier.validation";

export const createSupplier =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        supplierSchema.parse(
          req.body
        );

      const supplier =
        await createSupplierService(
          data
        );

      return res.status(201).json({
        success: true,
        data: supplier,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const getSuppliers =
  async (
    req: Request,
    res: Response
  ) => {
    const suppliers =
      await getSuppliersService();

    return res.json({
      success: true,
      data: suppliers,
    });
  };

export const updateSupplier =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const supplier =
  await updateSupplierService(
    req.params.id as string,
    req.body
  );

      return res.json({
        success: true,
        data: supplier,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };

export const deleteSupplier =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await deleteSupplierService(
  req.params.id as string
);

      return res.json({
        success: true,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };