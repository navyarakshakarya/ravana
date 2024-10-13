import gql from "graphql-tag";
import { ProductSchema } from "../../internal/product";
import { CategorySchema } from "../../internal/category";

export const schema = gql`
  type Query {
    _: Boolean
    _empty: String
  }
  type Mutation {
    _: Boolean
    _empty: String
  }
  type Subscription {
    _: Boolean
    _empty: String
  }
`;