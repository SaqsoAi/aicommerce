import {
  Response,
  NextFunction,
} from "express";

import {
  AuthRequest,
} from "../modules/auth/auth.middleware";

export const allowRoles =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const role =
      req.user?.role;

    if (
      !role ||
      !roles.includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };