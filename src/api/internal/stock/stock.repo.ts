import { UpdateQuery } from "mongoose";
import { Stock, IStockDocument } from ".";

export const getStocks = async (): Promise<IStockDocument[]> => {
  return Stock.find({ active: true, deletedAt: null }).lean().exec();
}

export const getStock = async (id: string): Promise<IStockDocument | null> => {
  return Stock.findOne({ _id: id, active: true, deletedAt: null }).populate("product").populate("transactions").lean().exec();
};

export const getStockWithoutProduct = async (id: string): Promise<IStockDocument | null> => {
  return Stock.findOne({ _id: id, active: true, deletedAt: null }).lean().exec();
}

export const getInactiveStock = async (id: string): Promise<IStockDocument | null> => {
  return Stock.findOne({ _id: id, active: false }).lean().exec();
}

export const getStocksByProduct = async (product: string): Promise<IStockDocument[] | null> => {
  return Stock.find({ product, deletedAt: null }).populate("product").populate("transactions").lean().exec();
}

export const getActiveStocksByProduct = async (product: string): Promise<IStockDocument[] | null> => {
  return Stock.find({ product, active: true, deletedAt: null }).sort({ createdAt: -1 }).lean().exec();
}

export const getStocksByTransaction = async (transaction: string): Promise<IStockDocument[] | null> => {
  return Stock.find({ transactions: transaction, deletedAt: null }).populate("product").populate("transactions").lean().exec();
}

export const createStock = async (stock: IStockDocument): Promise<IStockDocument> => {
  return new Stock(stock).save();
}

export const updateStock = async (id: string, update: Partial<IStockDocument>): Promise<IStockDocument | null> => {
  const updateQuery: UpdateQuery<IStockDocument> = { $set: update };
  return Stock.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
}

export const deleteStock = async (id: string): Promise<IStockDocument | null> => {
  const updateQuery: UpdateQuery<IStockDocument> = { $set: { active: false, deletedAt: new Date() } };
  return Stock.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
}

export const restoreStock = async (id: string): Promise<IStockDocument | null> => {
  const updateQuery: UpdateQuery<IStockDocument> = { $set: { active: true, deletedAt: null } };
  return Stock.findOneAndUpdate({ _id: id, active: false }, updateQuery, { new: true }).lean().exec();
}

export const countStocksByProduct = async (product: string): Promise<number> => {
  return Stock.countDocuments({ product, active: true, deletedAt: null }).exec();
}