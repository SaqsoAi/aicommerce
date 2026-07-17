import {
  Request,
  Response,
} from "express";

import {
  createBrandService,
  deleteBrandService,
  getBrandByIdService,
  getBrandsService,
  updateBrandService,
} from "../services/brand.service";

export const getBrands =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const search =
        req.query.search as string;

      const data =
        await getBrandsService(
          search
        );

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getBrandById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getBrandByIdService(
          String(req.params.id)
         );
  
      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const createBrand =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await createBrandService(
          req.body.name as string,
          req.body.logo ?? null
        );

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const updateBrand =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await updateBrandService(
          req.params.id as string,
          req.body.name as string,
          req.body.logo ?? null
        );

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const deleteBrand =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await deleteBrandService(
        req.params.id as string
      );

      return res.json({
        success: true,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
