import { Request, Response } from 'express';
import { productService } from './product.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ProductStatus } from '@prisma/client';
import { buildProductImageUrl } from '../../middlewares/upload.middleware';
import { AppError } from '../../utils/errors';

/**
 * Controller pour les endpoints produits
 */
export class ProductController {
  // ============================================
  // ROUTES PUBLIQUES
  // ============================================

  /**
   * GET /api/products
   * Liste des produits avec filtres
   */
  listProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.listProducts(req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/products/:id
   * Détails d'un produit
   */
  getProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getProduct(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  });

  /**
   * GET /api/products/categories
   * Liste des catégories
   */
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await productService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  });

  /**
   * GET /api/products/filters
   * Options de filtres disponibles
   */
  getFilters = asyncHandler(async (req: Request, res: Response) => {
    const filters = await productService.getFilters();

    res.status(200).json({
      success: true,
      data: filters,
    });
  });

  /**
   * GET /api/products/suggestions
   * Suggestions personnalisées pour l'utilisateur connecté
   */
  getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const suggestions = await productService.getSuggestions(userId, limit);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  });

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * GET /api/admin/products
   * Liste des produits (admin)
   */
  listProductsAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.listProductsAdmin(req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/admin/products/:id
   * Détails d'un produit (admin)
   */
  getProductAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getProductAdmin(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  });

  /**
   * POST /api/admin/products
   * Créer un produit
   */
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const primaryFile = filesMap?.image?.[0];
    const secondaryFiles = filesMap?.images ?? [];

    // Primary image is required for new products
    if (!primaryFile) {
      throw new AppError('Une image est requise pour créer un produit', 400);
    }

    const imageUrl = buildProductImageUrl(primaryFile.filename);
    const secondaryUrls = secondaryFiles
      .map((f) => buildProductImageUrl(f.filename))
      .filter((u): u is string => u !== null);

    const product = await productService.createProduct({
      ...req.body,
      image: imageUrl,
      images: secondaryUrls,
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: product,
    });
  });

  /**
   * PUT /api/admin/products/:id
   * Modifier un produit
   */
  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const primaryFile = filesMap?.image?.[0];
    const secondaryFiles = filesMap?.images ?? [];

    const imageUrl = primaryFile ? buildProductImageUrl(primaryFile.filename) : undefined;
    const newSecondaryUrls = secondaryFiles
      .map((f) => buildProductImageUrl(f.filename))
      .filter((u): u is string => u !== null);

    // removeImages is passed as a JSON string from the form
    let removeImages: string[] | undefined;
    if (req.body.removeImages) {
      try { removeImages = JSON.parse(req.body.removeImages); } catch { /* ignore */ }
    }

    const product = await productService.updateProduct(id, {
      ...req.body,
      ...(imageUrl && { image: imageUrl }),
      ...(newSecondaryUrls.length > 0 && { images: newSecondaryUrls }),
      ...(removeImages && { removeImages }),
    });

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: product,
    });
  });

  /**
   * DELETE /api/admin/products/:id
   * Supprimer un produit
   */
  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);

    res.status(200).json(result);
  });

  /**
   * PATCH /api/admin/products/:id/status
   * Changer le statut d'un produit
   */
  changeProductStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await productService.changeProductStatus(id, status as ProductStatus);

    res.status(200).json(result);
  });

  /**
   * PATCH /api/admin/products/:id/stock
   * Mettre à jour le stock d'un produit
   */
  updateStock = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await productService.updateStock(id, req.body);

    res.status(200).json(result);
  });
}

export const productController = new ProductController();
