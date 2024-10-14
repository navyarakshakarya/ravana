import { UpdateQuery } from "mongoose";
import { Transaction, ITransactionDocument } from ".";

export const getTransactions = async (): Promise<ITransactionDocument[]> => {
  return Transaction.find({ active: true, deletedAt: null }).sort({ createdAt: -1 }).lean().exec();
}

export const getTransaction = async (id: string): Promise<ITransactionDocument | null> => {
  return Transaction.findOne({ _id: id, active: true, deletedAt: null }).lean().exec();
}

export const getTransactionsByTransactionCode = async (transactionCode: string): Promise<ITransactionDocument[] | null> => {
  return Transaction.find({ transactionCode, active: true, deletedAt: null }).lean().exec();
}

export const getTransactionsByProduct = async (productId: string): Promise<ITransactionDocument[] | null> => {
  return Transaction.find({ product: productId, active: true, deletedAt: null }).lean().exec();
}

export const getOldestTransactions = async (productId: string): Promise<ITransactionDocument[] | null> => {
  return Transaction.find({ 
    product: productId, remainingQuantity: { $gt: 0 }, 
    active: true, deletedAt: null,
    transactionType: 'IN'
  }).sort({ createdAt: 1 }).lean().exec();
}

export const createTransaction = async (transaction: ITransactionDocument): Promise<ITransactionDocument> => {
  return new Transaction(transaction).save();
}

export const updateTransaction = async (id: string, update: UpdateQuery<ITransactionDocument>): Promise<ITransactionDocument | null> => {
  return Transaction.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, update, { new: true }).lean().exec();
}

export const updateTransactionByTransactionCode = async (transactionCode: string, update: UpdateQuery<ITransactionDocument>): Promise<ITransactionDocument | null> => {
  return Transaction.findOneAndUpdate({ transactionCode, active: true, deletedAt: null }, update, { new: true }).lean().exec();
}