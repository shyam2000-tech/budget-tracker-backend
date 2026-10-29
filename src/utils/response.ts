import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>
): Response => {
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, any>
): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  message = "An error occurred",
  statusCode = 400,
  errors?: any
): Response => {
  return sendResponse(res, statusCode, {
    success: false,
    message,
    errors,
  });
};

