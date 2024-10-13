import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

export const useRequestIDMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingRequestId = req.headers["x-request-id"] as string;
  const requestId = existingRequestId || uuidv4();
  res.setHeader("X-Request-ID", requestId);
  
  next();
};
