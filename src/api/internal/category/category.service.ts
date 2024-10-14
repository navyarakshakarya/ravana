import { log } from "../../../lib";
import { ProductService } from "../product";
import { ICategoryDocument } from ".";
import * as categoryRepo from "./category.repo";

/**
 * Retrieve all active categories.
 *
 * @returns a promise that resolves to an array of categories.
 */
export const getCategories = async (): Promise<ICategoryDocument[]> => {
  return categoryRepo.getCategories();
}

/**
 * Retrieve an active category by id.
 *
 * @param id the id of the category to retrieve
 * @returns a promise that resolves to the category if found, null otherwise.
 */
export const getCategory = async (id: string): Promise<ICategoryDocument | null> => {
  return categoryRepo.getCategory(id);
}

/**
 * Retrieve an active category by code.
 *
 * @param code the code of the category to retrieve
 * @returns a promise that resolves to the category if found, null otherwise.
 */
export const getCategoryByCode = async (code: string): Promise<ICategoryDocument | null> => {
  return categoryRepo.getCategoryByCode(code);
}

/**
 * Create a new category.
 *
 * @param category the category to create
 * @returns a promise that resolves to the created category.
 */
export const createCategory = async (category: ICategoryDocument): Promise<ICategoryDocument> => {
  log.info("Request to create category", { category })
  //TODO: get active user for audit purpose
  category.createdBy = "SYSTEM";
  return categoryRepo.createCategory(category);
}

/**
 * Update an existing category.
 *
 * @param id the id of the category to update
 * @param update a partial category document with the fields to update
 * @returns a promise that resolves to the updated category if found, null otherwise.
 */
export const updateCategory = async (id: string, update: Partial<ICategoryDocument>): Promise<ICategoryDocument | null> => {
  // TODO: update category code
  log.info("Request to update category", { id, update })
  return categoryRepo.updateCategory(id, update);
}

/**
 * Soft delete a category.
 *
 * @param id the id of the category to delete
 * @returns a promise that resolves to the deleted category if found, null otherwise.
 *
 * @throws {Error} if the category is used in products
 */
export const deleteCategory = async (id: string): Promise<ICategoryDocument | null> => {
  // Check if category is used in product, if so throw error
  log.info("Request to delete category", { id })
  const isCategoryUsed = await ProductService.isCategorySafeToDelete(id);
  if (!isCategoryUsed) throw new Error("Category is used in products");
  return categoryRepo.deleteCategory(id);
}

/**
 * Restore a deleted category.
 *
 * @param id the id of the category to restore
 * @returns a promise that resolves to the restored category if found, null otherwise.
 */
export const restoreCategory = async (id: string): Promise<ICategoryDocument | null> => {
  log.info("Request to restore category", { id })
  return categoryRepo.restoreCategory(id);
}