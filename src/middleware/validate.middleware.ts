import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/AppError";

interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        for (const key of Object.keys(req.query)) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new AppError("Validation failed", 400, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
