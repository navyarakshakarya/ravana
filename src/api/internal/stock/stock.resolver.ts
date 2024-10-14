import { StockService, IStockDocument, Stock } from "."
import { ProductService } from "../product";
import { TransactionService } from "../transaction";

export const resolver = {
  Query: {
    GetStocks: async () => {
      return StockService.getStocks();
    },
    GetStock: async (_: any, _id: string) => {
      return StockService.getStock(_id);
    }
  },

  Stock: {
    product: async (parent: IStockDocument) => {
      return ProductService.getProduct(parent.product.toString());
    },
    transactions: async (parent: IStockDocument) => {
      for(const transaction of parent.transactions) {
        const transactionDoc = await TransactionService.getTransaction(transaction.toString());
        if (!transactionDoc) continue;
      }
    }
  }
}