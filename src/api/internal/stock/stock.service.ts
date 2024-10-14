import mongoose from "mongoose";
import { log } from "../../../lib";
import { Product, ProductService } from "../product";
import { ITransactionDocument, TransactionService } from "../transaction";
import { IStockDocument } from "./stock.model";
import * as stockRepo from "./stock.repo";

export const getStocks = async (): Promise<IStockDocument[]> => {
  return stockRepo.getStocks();
}

export const getStock = async (id: string): Promise<IStockDocument | null> => {
  return stockRepo.getStock(id);
}

export const getStocksByProduct = async (product: string): Promise<IStockDocument[] | null> => {
  return stockRepo.getStocksByProduct(product);
}

export const getActiveStocksByProduct = async (product: string): Promise<IStockDocument[] | null> => {
  return stockRepo.getActiveStocksByProduct(product);
}

export const getStocksByTransaction = async (transaction: string): Promise<IStockDocument[] | null> => {
  console.log("getStocksByTransaction", transaction)
  return stockRepo.getStocksByTransaction(transaction);
}

export const createStock = async (stock: IStockDocument): Promise<IStockDocument> => {
  log.info("Request to create stock", { stock })
  const productId = stock.product.toString();
  stock.createdBy = "SYSTEM";
  const createdStock = await stockRepo.createStock(stock);
  await ProductService.insertOrUpdateProductStock(productId);
  return createdStock;
}

export const appendTransactionsToStock = async (stock: IStockDocument, transactions: mongoose.ObjectId[]): Promise<IStockDocument | null> => {
  log.info("Request to append transactions to stock", { stock, transactions })
  const stockId = (stock as any)._id.toString();
  const foundStock = await getStock(stockId);
  if(!foundStock) throw new Error("Stock not found");
  const stockTransactions = [...foundStock.transactions, ...transactions];
  const updatedStock = await updateStock(stockId, { transactions: stockTransactions });
  return updatedStock;
}

export const popTransactionsFromStock = async (stock: IStockDocument, transactions: mongoose.ObjectId[]): Promise<IStockDocument | null> => {
  log.info("Request to pop transactions from stock", { stock, transactions })
  const stockId = (stock as any)._id.toString();
  const stockTransactions = stock.transactions.filter(t => !transactions.includes(t));
  const updatedStock = await updateStock(stockId, { transactions: stockTransactions });
  return updatedStock;
}

export const updateStock = async (id: string, update: Partial<IStockDocument>): Promise<IStockDocument | null> => {
  log.info("Request to update stock", { id, update })
  //TODO: check if stockLevel is updated
  //TODO: check if product is updated
  const stockExist = await stockRepo.getStockWithoutProduct(id);
  if(!stockExist) {
    throw new Error("Stock not found");
  }
  const updatedStock = stockRepo.updateStock(id, update);
  const productId = stockExist.product.toString();
  if(update.stockLevel) {
    ProductService.insertOrUpdateProductStock(productId);
  }
  return updatedStock;
}

export const deleteStock = async (id: string): Promise<IStockDocument | null> => {
  log.info("Request to delete stock", { id })
  const stockExist = await stockRepo.getStockWithoutProduct(id);
  if(!stockExist) {
    throw new Error("Stock not found");
  }
  const deletedStock = stockRepo.deleteStock(id);
  const productId = stockExist.product.toString();
  ProductService.insertOrUpdateProductStock(productId); 
  return deletedStock;
}

export const restoreStock = async (id: string): Promise<IStockDocument | null> => {
  log.info("Request to restore stock", { id })
  const stockExist = await stockRepo.getInactiveStock(id);
  if(!stockExist) {
    throw new Error("Stock not found");
  }
  const restoredStock = stockRepo.restoreStock(id);
  const productId = stockExist.product.toString();
  ProductService.insertOrUpdateProductStock(productId);
  return restoredStock;
}

export const recountStockLevelByProduct = async (product: string): Promise<number> => {
  log.info("Request to re-count stock level by product", { product })
  const stocks = await getStocksByProduct(product);
  if (stocks) {
    const productStocks = stocks.filter(stock => stock.active);
    const totalStock = productStocks.reduce((acc, stock) => acc + stock.stockLevel, 0);
    return totalStock
  }
  return 0;
}
