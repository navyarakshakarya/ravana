import { GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { ProductType } from "../types/productType";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/productService";

const ProductMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createProduct: {
      type: ProductType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
      },
      resolve: (_, args) => createProduct(args),
    },
    updateProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLInt },
      },
      resolve: (_, args) => updateProduct(args),
    },
    deleteProduct: {
      type: ProductType,
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, { id }) => deleteProduct(id),
    },
  },
});

const ProductQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    products: {
      type: new GraphQLList(ProductType),
      resolve: () => getProducts(),
    },
  },
});

export const productSchema = new GraphQLSchema({
  query: ProductQuery,
  mutation: ProductMutation,
});
