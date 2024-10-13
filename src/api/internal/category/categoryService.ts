import { ICategoryDocument } from "./categoryModel";
import * as categoryRepo from "./categoryRepo";

export const createCategory = async (category: ICategoryDocument): Promise<ICategoryDocument> =>
  await categoryRepo.createCategory(category);

export const getCategories = async (): Promise<ICategoryDocument[]> =>
  await categoryRepo.getCategories();

export const getCategoryById = async (id: string): Promise<ICategoryDocument | null> =>
  await categoryRepo.getCategoryById(id);

export const updateCategory = async (category: Partial<ICategoryDocument>): Promise<ICategoryDocument | null> =>
  await categoryRepo.updateCategory(category);

export const deleteCategory = async (id: string): Promise<ICategoryDocument | null> =>
  await categoryRepo.softDeleteCategory(id)
