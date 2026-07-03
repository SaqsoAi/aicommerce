import {
  Request,
  Response,
} from "express";

import {
  getProfileService,
  updateProfileService,
  getUserOrdersService,
  getUserWishlistService,
} from "./account.service";

export const getProfile =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const profile =
        await getProfileService(
          req.user.id
        );

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  };

export const updateProfile =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const profile =
        await updateProfileService(
          req.user.id,
          req.body
        );

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  };

export const getMyOrders =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const orders =
        await getUserOrdersService(
          req.user.id
        );

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  };

export const getMyWishlist =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const wishlist =
        await getUserWishlistService(
          req.user.id
        );

      res.json({
        success: true,
        data: wishlist,
      });
    } catch (error: any) {
      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  };