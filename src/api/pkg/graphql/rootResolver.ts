import { GraphQLDateTime } from "graphql-scalars";
import { categoryResolver } from "../../internal/category";
import { productResolver } from "../../internal/product";
import { stockResolver } from "../../internal/stock";
import { transactionResolver } from "../../internal/transaction";

export const resolver = {
  Date: GraphQLDateTime,
  Query: {
    ...categoryResolver.Query,
    ...productResolver.Query,
    ...stockResolver.Query,
    ...transactionResolver.Query
  },
  Mutation: {
    ...categoryResolver.Mutation,
    ...productResolver.Mutation,
    ...transactionResolver.Mutation
  },
  Subscription: {
  }
};