import { Response } from "express";

import {
  getAccountProfile,
  updateAccountProfile,
  getAccountOrders,
  getAccountWishlist,
} from "./account.service";

function getUserId(req: any): string | null {
  return req.user?.id || req.user?.userId || null;
}

export const getProfile = async (req: any, res: Response) => {
  try {
    const profile = await getAccountProfile(getUserId(req));
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load account profile" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const profile = await updateAccountProfile(getUserId(req), req.body || {});
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update account profile" });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await getAccountOrders(getUserId(req) || "");
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load account orders" });
  }
};

export const getMyWishlist = async (req: any, res: Response) => {
  try {
    const wishlist = await getAccountWishlist(getUserId(req) || "");
    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load account wishlist" });
  }
};


