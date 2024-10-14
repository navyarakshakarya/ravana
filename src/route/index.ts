import express, { NextFunction, Request, Response, Router } from "express";
import {
  useRequestIDMiddleware,
  useErrorMiddleware,
  useJwtMiddleware,
} from "../lib";
import { createHandler } from "graphql-http/lib/use/express";

const router: Router = express.Router();
router.use(useRequestIDMiddleware);

router.use(useErrorMiddleware);
export default router;
