import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Invalid resource identifier: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new AppError(message, 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message);
    error = new AppError(`Validation error: ${messages.join(", ")}`, 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Authentication token has expired", 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const details = error.details || (process.env.NODE_ENV === "development" ? err.stack : undefined);

  if (statusCode === 500) {
    console.error("[Unhandled Error]:", err);
  }

  sendError(res, message, statusCode, details);
};

