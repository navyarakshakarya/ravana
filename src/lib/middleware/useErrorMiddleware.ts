import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MongoServerError } from "mongodb";
import { log } from "../config/logging";
import { env, Environment } from "../config/env";

export const useErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let e = env
  if(!e){
    e = Environment.getInstance()
  }
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const txId = res.getHeader("X-Request-ID") || "";
  const message = err.message || "Internal Server Error";
  const stack = process.env.ENV === "development" ? err.stack : undefined;
  const ip = req.headers["x-real-ip"] || "";

  if (err instanceof ZodError) {
    res.status(400).json({
      time: new Date(),
      requestId: txId,
      message: "Bad Request",
      error: err.errors,
    });

    log.error("Bad Request", {
      statusCode,
      ip: ip,
      requestId: txId,
      error: err.errors,
    });
    return;
  }

  if (err instanceof MongoServerError) {
    if (err.code === 11000) {
      res.status(409).json({
        time: new Date(),
        requestId: txId,
        message: `Conflict: Duplicate key error. ${Object.keys(err.keyValue)[0]} is already taken`,
        error: {
          field: `${Object.keys(err.keyValue)[0]} is already taken`,
          value: Object.values(err.keyValue)[0],
        },
      });

      log.error("Conflict: Duplicate key error.", {
        statusCode,
        ip: ip,
        requestId: txId,
        error: {
          field: Object.keys(err.keyValue)[0],
          value: Object.values(err.keyValue)[0],
        },
      });
      return;
    }

    res.status(500).json({
      time: new Date(),
      requestId: txId,
      message: "MongoDB Error",
      error: {
        name: err.name,
        message: err.message,
      },
    });

    log.error("MongoDB Error", {
      statusCode,
      ip: ip,
      requestId: txId,
      error: {
        name: err.name,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof Error) {
    res.status(statusCode).json({
      time: new Date(),
      requestId: txId,
      message: message,
      error: {
        name: err.name,
        message: err.message,
        stack: stack,
      },
    });

    log.error(message, {
      statusCode,
      ip: ip,
      requestId: txId,
      error: {
        name: err.name,
        message: err.message,
        ...(e.getStr("NODE_ENV") === "development" && stack && { stack: stack }),
      },
    });
    return;
  }
};
