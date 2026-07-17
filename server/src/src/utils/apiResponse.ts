import type { Response } from "express";

type ApiMeta = Record<string, unknown>;

export const ok = <T>(
  res: Response,
  data: T,
  message = "Success",
  meta?: ApiMeta
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const created = <T>(
  res: Response,
  data: T,
  message = "Created successfully",
  meta?: ApiMeta
) => {
  return res.status(201).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const noContent = (
  res: Response
) => {
  return res.status(204).send();
};

export const fail = (
  res: Response,
  message = "Error",
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export const paginated = <T>(
  res: Response,
  data: T,
  pagination: ApiMeta,
  message = "Success"
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const success = ok;
export const error = fail;
