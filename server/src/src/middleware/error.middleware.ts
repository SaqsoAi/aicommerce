import type {
  Request,
  Response,
  NextFunction,
} from "express";

type AppError = Error & {
  statusCode?: number;
  status?: number;
  errors?: unknown;
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode =
    err.statusCode ||
    err.status ||
    500;

  const message =
    err.message ||
    "Internal Server Error";

  if (process.env.NODE_ENV !== "test") {
    console.error("GLOBAL_ERROR:", {
      message,
      statusCode,
      stack: err.stack,
      errors: err.errors,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors ? { errors: err.errors } : {}),
  });
};
