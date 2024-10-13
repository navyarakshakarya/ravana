import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env, Environment } from "../config/env";

export const useJwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let e = env
  if (!e) {
    e = Environment.getInstance()
  }
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401)
    throw Error('No token provided or invalid format')
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401)
    throw Error('No token provided or invalid format')
  }
  const secretKey = e.getStr("SECRET_KEY");
  if (!secretKey) {
    throw Error('No secret key provided')
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      throw Error('Invalid token or expired')
    }
    try{
      next();
    }catch(err){
      next(err);
    }
  });

}