import { Request, Response } from 'express';
import { cartService } from './cart.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Controller pour les endpoints panier
 */
export class CartController {
  /**
   * GET /api/orders/cart
   * Récupérer le panier de l'utilisateur connecté
   */
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  });

  /**
   * POST /api/orders/cart
   * Ajouter un item dans le panier (avec suppléments optionnels)
   * Body: { productId: string, quantity: number, supplements?: [{ supplementId, quantity }] }
   */
  addItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.addItem(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Article ajouté au panier',
      data: cart,
    });
  });

  /**
   * PATCH /api/orders/cart/:itemId
   * Mettre à jour la quantité d'une ligne précise du panier
   */
  updateItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.updateItemQuantity(
      userId,
      req.params.itemId,
      req.body.quantity
    );

    res.status(200).json({
      success: true,
      message: 'Quantité mise à jour',
      data: cart,
    });
  });

  /**
   * DELETE /api/orders/cart/:itemId
   * Retirer une ligne précise du panier
   */
  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.removeItem(userId, req.params.itemId);

    res.status(200).json({
      success: true,
      message: 'Article retiré du panier',
      data: cart,
    });
  });

  /**
   * DELETE /api/orders/cart
   * Vider le panier
   */
  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await cartService.clearCart(userId);

    res.status(200).json(result);
  });

  /**
   * POST /api/orders/cart/merge
   * Fusionner le panier local (déconnecté) avec le panier serveur
   * Body: { items: [{ productId, quantity, supplements? }] }
   */
  mergeCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.mergeCart(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Panier synchronisé',
      data: cart,
    });
  });
}

export const cartController = new CartController();