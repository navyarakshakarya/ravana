import express, { NextFunction, Request, Response, Router } from "express";
import {
  useRequestIDMiddleware,
  useErrorMiddleware,
  useJwtMiddleware,
} from "../lib";
import { createHandler } from "graphql-http/lib/use/express";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { productSchema } from "../api/schemas/productSchema";

const router: Router = express.Router();
router.use(useRequestIDMiddleware);

router.all("/graphql", createHandler({schema: productSchema}));

router.use(useErrorMiddleware);
export default router;
