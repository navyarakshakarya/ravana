import { CategoryService, ICategoryDocument } from ".";

export const resolver = {
  Query: {
    GetCategories: async () => {
      return CategoryService.getCategories();
    },
    GetCategory: async (_: any, _id: string) => {
      return CategoryService.getCategory(_id);
    },
  },
  Mutation: {
    CreateCategory: async (_: any, args: { data: ICategoryDocument } ) => {
      return CategoryService.createCategory(args.data);
    },
    UpdateCategory: async (_: any, args: { _id: string; data: Partial<ICategoryDocument> }) => {
      return CategoryService.updateCategory(args._id, args.data);
    },
    DeleteCategory: async (_: any, _id: string) => {
      return CategoryService.deleteCategory(_id);
    },
    RestoreCategory: async (_: any, _id: string) => {
      return CategoryService.restoreCategory(_id);
    },
  },
}