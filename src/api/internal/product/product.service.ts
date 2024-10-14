import { log } from "../../../lib";
import { IProductDocument } from ".";
import * as productRepo from "./product.repo";
import { StockService } from "../stock";
import { CategoryService } from "../category";


/**
 * Retrieve all active products.
 *
 * @returns a promise that resolves to an array of products.
 */
export const getProducts = async (): Promise<IProductDocument[]> => {
  return productRepo.getProducts();
}

/**
 * Retrieve an active product by id.
 *
 * @param id the id of the product
 * @returns a promise that resolves to the product if found, null otherwise.
 */
export const getProduct = async (id: string): Promise<IProductDocument | null> => {
  return productRepo.getProduct(id);
}


/**
 * Retrieve an active product by code.
 *
 * @param code the code of the product
 * @returns a promise that resolves to the product if found, null otherwise.
 */
export const getProductByCode = async (code: string): Promise<IProductDocument | null> => {
  return productRepo.getProductByCode(code);
}

/**
 * Retrieve all active products that belong to a category.
 *
 * @param category the category of the products to retrieve
 * @returns a promise that resolves to an array of products.
 */
export const getProductsByCategory = async (category: string): Promise<IProductDocument[]> => {
  return productRepo.getProductsByCategory(category);
}

/**
 * Create a product.
 *
 * @param product the product to create
 * @returns a promise that resolves to the created product.
 */
export const createProduct = async (product: IProductDocument): Promise<IProductDocument> => {
  log.info("Request to create product", { product })
  //TODO: get active user for audit purpose
  product.createdBy = "SYSTEM";
  const categoryId = product.category.toString();
  const categoryExist = CategoryService.getCategory(categoryId);
  if (!categoryExist) throw new Error("Category not found");
  return productRepo.createProduct(product);
}

/**
 * Update a product.
 *
 * @param id the id of the product to update
 * @param data a partial product document with the fields to update
 * @returns a promise that resolves to the updated product if found, null otherwise.
 */
export const updateProduct = async (id: string, data: Partial<IProductDocument>): Promise<IProductDocument | null> => {
  log.info("Request to update product", { id, update: data })
  return productRepo.updateProduct(id, data);
}

/**
 * Soft delete a product.
 *
 * @param id the id of the product to delete
 * @returns a promise that resolves to the deleted product if found, null otherwise.
 */
export const deleteProduct = async (id: string): Promise<IProductDocument | null> => {
  log.info("Request to delete product", { id })
  return productRepo.deleteProduct(id);
}

/**
 * Restore a deleted product.
 *
 * @param id the id of the product to restore
 * @returns a promise that resolves to the restored product if found, null otherwise.
 */
export const restoreProduct = async (id: string): Promise<IProductDocument | null> => {
  log.info("Request to restore product", { id })
  return productRepo.restoreProduct(id);
} 


/**
 * Check if a category is safe to delete.
 *
 * A category is safe to delete if it does not have any products associated with it.
 *
 * @param id the id of the category to check
 * @returns a promise that resolves to true if the category is safe to delete, false otherwise.
 */
export const isCategorySafeToDelete = async (id: string): Promise<boolean> => {
  const products = await getProductsByCategory(id);
  return products.length === 0;
}

export const insertOrUpdateProductStock = async (id: string): Promise<IProductDocument | null> => {
  try{
    log.info("Request to update stock level", { id })
    const productExist = await getProduct(id);
    if (!productExist) {
      throw new Error("Product does not exist");
    }
    const newStockCount = await StockService.recountStockLevelByProduct(id);
    return productRepo.updateProduct(id, { stockLevel: newStockCount });
  }catch(err: any){
    console.log(err);
    throw err;
  }
}
