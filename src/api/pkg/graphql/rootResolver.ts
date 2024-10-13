import { categoryResolver } from "../../internal/category";
import { productResolver } from "../../internal/product";

export const resolver = {
  Query: {
    ...productResolver.Query,
    ...categoryResolver.Query
  },
  Mutation: {
    ...productResolver.Mutation,
    ...categoryResolver.Mutation
  },
  Subscription: {
    
  },
};