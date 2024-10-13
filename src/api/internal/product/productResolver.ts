import { Category } from "../category";
import { IProductDocument } from "./productModel";
import * as productService from "./productService";

export const resolver = {
  Query: {
    products: async () => await productService.getProducts(),
    product: async (parent: any, args: { id: string; }) => await productService.getProductById(args.id),
  },
  Mutation: {
    createProduct: async (_: any, args: { product: IProductDocument; }) => await productService.createProduct(args.product),
    updateProduct: async (_: any, args: { product: IProductDocument; }) => await productService.updateProduct(args.product),
    deleteProduct: async (_: any, args: { id: string; }) => await productService.softDeleteProduct(args.id),
  },
  Product: {
    category: async (parent: any) => await Category.findById(parent.category)
  }
}