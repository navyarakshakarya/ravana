import { ProductService, IProductDocument } from ".";
import { CategoryService } from "../category";
import { StockService } from "../stock";

export const resolver = {
  Query: {
    GetProducts: async () => {
      return ProductService.getProducts();
    },
    GetProduct: async (_: any, _id: string) => {
      return ProductService.getProduct(_id);
    }
  },
  Mutation: {
    CreateProduct: async (_: any, args: { data: IProductDocument } ) => {
      return ProductService.createProduct(args.data);
    },
    UpdateProduct: async (_: any, args: { _id: string; data: Partial<IProductDocument> }) => {
      return ProductService.updateProduct(args._id, args.data);
    },
    DeleteProduct: async (_: any, _id: string) => {
      return ProductService.deleteProduct(_id);
    },
    RestoreProduct: async (_: any, _id: string) => {
      return ProductService.restoreProduct(_id);
    },
  },
  Product: {
    category: async (parent: IProductDocument) => {
      return CategoryService.getCategory(parent.category.toString());
    },
    stocks: async (parent: IProductDocument) => {
      return StockService.getStocksByProduct(parent.id.toString());
    }
  }
}