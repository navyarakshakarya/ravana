import { Product } from "../product";
import { ICategoryDocument } from "./categoryModel";
import * as categoryService from "./categoryService";

export const resolver = {
  Query: {
    getCategories: async () => await categoryService.getCategories(),
    getCategoryById: async (_: any, args: { id: string; }) => await categoryService.getCategoryById(args.id),
  },
  Mutation: {
    createCategory: async (_: any, args: ICategoryDocument) => await categoryService.createCategory(args),
    updateCategory: async (_: any, args: Partial<ICategoryDocument>) => await categoryService.updateCategory(args),
    deleteCategory: async (_: any, args: { id: string; }) => await categoryService.deleteCategory(args.id),
  },
  Category: {
    products: async (parent: any) => Product.find({ category: parent._id })
  }
}