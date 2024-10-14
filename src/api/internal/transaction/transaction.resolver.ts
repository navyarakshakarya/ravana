import { ITransactionDocument, TransactionService } from ".";

export const resolver = {
  Query: {
    GetTransactions: async () => {
      return await TransactionService.getTransactions();
    },
    GetTransactionsByProduct: async (_: any, args: { productId: string }) => {
      return await TransactionService.getTransactionsByProduct(args.productId);
    },
    GetTransaction: async (_: any, args: { _id: string }) => {
      return await TransactionService.getTransaction(args._id);
    }
  },
  Mutation: {
    StockReceived: async (_: any, args: { data: ITransactionDocument }) => {
      return await TransactionService.stockReceivedTransaction(args.data);
    },
    StockConsumed: async (_: any, args: { data: ITransactionDocument }) => {
      return await TransactionService.stockConsumedTransaction(args.data);
    },
    StockAdjusted: async (_: any, args: { data: ITransactionDocument }) => {
      return await TransactionService.stockAdjustTransaction(args.data);  
    }
  },
}