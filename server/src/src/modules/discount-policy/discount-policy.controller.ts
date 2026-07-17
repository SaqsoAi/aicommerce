import { Request, Response } from "express";
import {
  getDiscountPolicyService,
  updateDiscountPolicyService,
} from "./discount-policy.service";

export const getDiscountPolicy = async (_req: Request, res: Response) => {
  try {
    const data = await getDiscountPolicyService();

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

export const updateDiscountPolicy = async (req: Request, res: Response) => {
  try {
    const data = await updateDiscountPolicyService(req.body);

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
