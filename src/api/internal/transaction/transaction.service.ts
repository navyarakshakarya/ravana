import { ITransactionDocument, Transaction } from ".";
import { log } from "../../../lib";
import { ProductService } from "../product";
import { IStockDocument, Stock, StockService } from "../stock";
import * as transactionRepo from "./transaction.repo";

export const getTransactions = (): Promise<ITransactionDocument[]> => 
  transactionRepo.getTransactions();

export const getTransaction = (transactionId: string): Promise<ITransactionDocument | null> => 
  transactionRepo.getTransaction(transactionId);

export const getTransactionsByTransactionCode = (transactionCode: string): Promise<ITransactionDocument[] | null> => 
  transactionRepo.getTransactionsByTransactionCode(transactionCode);

export const getTransactionsByProduct = (productId: string): Promise<ITransactionDocument[] | null> => 
  transactionRepo.getTransactionsByProduct(productId);

export const createTransaction = async (transaction: ITransactionDocument): Promise<ITransactionDocument> => {
  const newTransaction = new Transaction({ ...transaction, createdBy: "SYSTEM" });
  log.info("Request to create transaction", { transaction: newTransaction });
  return transactionRepo.createTransaction(newTransaction);
};

const formatDate = (date: Date): string => {
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
  const d = new Date(date);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  const milliseconds = pad(d.getMilliseconds(), 3);
  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

const createStockFromTransaction = (transaction: ITransactionDocument, stockCode: string): IStockDocument => new Stock({
  product: transaction.product,
  stockCode,
  quantity: transaction.quantity,
  stockLevel: transaction.quantity,
  price: transaction.price,
  sellPrice: transaction.sellPrice,
  active: true,
  createdBy: "SYSTEM",
  updatedBy: "SYSTEM"
});

export const stockReceivedTransaction = async (transaction: ITransactionDocument): Promise<ITransactionDocument> => {
  log.info("Request to create received transaction", { transaction });
  const now = formatDate(new Date());
  const product = await ProductService.getProduct(transaction.product.toString());
  if (!product) throw new Error("Product not found");

  const stockCode = `${product.productCode}#${now}`;
  const stock = createStockFromTransaction(transaction, stockCode);

  const newTransaction = new Transaction({
    ...transaction,
    transactionCode: `IN#${now}`,
    transactionType: "IN",
    remainingQuantity: transaction.quantity,
    createdBy: "SYSTEM"
  });

  const savedTransaction = await transactionRepo.createTransaction(newTransaction);
  const savedStock = await StockService.createStock(stock);

  await StockService.appendTransactionsToStock(savedStock, [(savedTransaction as any)._id]);
  log.info("Created received transaction", { transaction: savedTransaction });
  return savedTransaction;
};

const createOutTransaction = (transaction: ITransactionDocument, quantity: number, now: string, price: number): ITransactionDocument => new Transaction({
  product: transaction.product,
  transactionCode: `OUT#${now}`,
  quantity,
  remainingQuantity: 0,
  price,
  sellPrice: transaction.sellPrice,
  transactionType: "OUT",
  receivedAt: new Date(),
  createdBy: "SYSTEM"
});

export const stockConsumedTransaction = async (transaction: ITransactionDocument): Promise<ITransactionDocument[]> => {
  log.info("Request to create consumed transaction", { transaction });
  const now = formatDate(new Date());
  const product = await ProductService.getProduct(transaction.product.toString());
  if (!product) throw new Error("Product not found");
  if (!product.stockLevel || transaction.quantity > product.stockLevel) throw new Error("Not enough stock available");

  const fifoTransactions = await transactionRepo.getOldestTransactions(transaction.product.toString());
  if (!fifoTransactions || fifoTransactions.length === 0) throw new Error("No stock available");

  let toDeductQuantity = transaction.quantity;
  const deductedTransactions: ITransactionDocument[] = [];

  for (const fifoTransaction of fifoTransactions) {
    if (toDeductQuantity <= 0) break;

    const availableQuantity = fifoTransaction.remainingQuantity;
    const deductedQuantity = Math.min(toDeductQuantity, availableQuantity);
    
    const updatedTransaction = { ...fifoTransaction, remainingQuantity: availableQuantity - deductedQuantity };
    await transactionRepo.updateTransaction((fifoTransaction as any)._id, updatedTransaction);

    const outTransaction = createOutTransaction(transaction, deductedQuantity, now, fifoTransaction.price);
    const newTransaction = await transactionRepo.createTransaction(outTransaction);

    const stocks = await StockService.getStocksByTransaction((fifoTransaction as any)._id.toString());
    if (!stocks || stocks.length === 0) throw new Error("Stock not found");

    const updatedStock = { stockLevel: stocks[0].stockLevel - deductedQuantity };
    const stockUpdated = await StockService.updateStock((stocks[0] as any)._id, updatedStock);
    await StockService.appendTransactionsToStock((stockUpdated as any)._id, [(newTransaction as any)._id]);

    deductedTransactions.push(newTransaction);
    toDeductQuantity -= deductedQuantity;
  }

  // await ProductService.insertOrUpdateProductStock(transaction.product.toString());

  log.info("Created consumed transaction", { transactions: deductedTransactions });
  return deductedTransactions;
};

const adjustInTransaction = async (transaction: ITransactionDocument, newQuantity: number): Promise<ITransactionDocument> => {
  const difference = newQuantity - transaction.quantity;

  const stocks = await StockService.getStocksByTransaction((transaction as any)._id.toString());
  if (!stocks || stocks.length === 0) throw new Error("Stock not found");

  const updatedStock = { stockLevel: stocks[0].stockLevel + difference };
  const stockUpdated = await StockService.updateStock((stocks[0] as any)._id, updatedStock);

  const updatedTransaction = new Transaction({ ...transaction, quantity: newQuantity, remainingQuantity: newQuantity });
  await transactionRepo.updateTransactionByTransactionCode(transaction.transactionCode, updatedTransaction);

  // const stockWithTransactions = await StockService.getStock((stockUpdated as any)._id.toString());
  await StockService.appendTransactionsToStock((stockUpdated as any)._id, [(transaction as any)._id]);

  log.info("Adjusted 'IN' transaction", { transaction: updatedTransaction });

  return updatedTransaction;
};

const adjustOutTransaction = async (transaction: ITransactionDocument, newQuantity: number): Promise<ITransactionDocument[]> => {
  const toAdjustQuantity = newQuantity - transaction.quantity;
  const adjustedTransactions: ITransactionDocument[] = [];

  const fifoTransactions = await transactionRepo.getOldestTransactions(transaction.product.toString());
  if (!fifoTransactions || fifoTransactions.length === 0) throw new Error("No stock available");
  for (const fifoTransaction of fifoTransactions) {
    if (toAdjustQuantity === 0 || fifoTransaction.remainingQuantity === 0) continue;

    const availableQuantity = fifoTransaction.remainingQuantity;
    const adjustedQuantity = Math.min(toAdjustQuantity, availableQuantity);

    const updatedFifoTransaction = { ...fifoTransaction, remainingQuantity: availableQuantity - adjustedQuantity };
    await transactionRepo.updateTransaction((fifoTransaction as any)._id, updatedFifoTransaction);

    const newOutTransaction = createOutTransaction(transaction, adjustedQuantity, formatDate(new Date()), fifoTransaction.price);
    const savedTransaction = await transactionRepo.createTransaction(newOutTransaction);

    const stocks = await StockService.getStocksByTransaction((fifoTransaction as any)._id.toString());
    if(!stocks || stocks.length === 0) throw new Error("Stock not found");
    const updatedStock = {stockLevel: stocks[0].stockLevel - adjustedQuantity }
    const stockUpdated = await StockService.updateStock((stocks[0] as any)._id, updatedStock);
    await StockService.appendTransactionsToStock((stockUpdated as any)._id, [(savedTransaction as any)._id]);

    adjustedTransactions.push(savedTransaction);
  }

  return adjustedTransactions;
};
export const stockAdjustTransaction = async (transaction: ITransactionDocument): Promise<ITransactionDocument[]> => {
  if (!transaction) throw new Error("Transaction not found");

  const adjustedTransactions = await transactionRepo.getTransactionsByTransactionCode(transaction.transactionCode);
  if (!adjustedTransactions || adjustedTransactions.length === 0) throw new Error("Transaction not found");

  const adjustFuncs: { 
    [key: string]: (transaction: ITransactionDocument, newQuantity: number) => Promise<ITransactionDocument | ITransactionDocument[]> 
  } = {
    IN: adjustInTransaction,
    OUT: adjustOutTransaction
  };

  if (!adjustFuncs[transaction.transactionType]) {
    throw new Error(`Unsupported transaction type: ${transaction.transactionType}`);
  }

  const adjustedResults = await Promise.all(
    adjustedTransactions.map(adjustedTransaction => 
      adjustFuncs[transaction.transactionType](adjustedTransaction, transaction.quantity)
    )
  );

  // Flatten the results since `adjustOutTransaction` might return multiple transactions
  return adjustedResults.flat();
};
