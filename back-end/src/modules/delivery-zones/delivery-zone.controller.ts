import { Request, Response } from 'express';
import { deliveryZoneService } from './delivery-zone.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Controller pour les endpoints zones de livraison
 */
export class DeliveryZoneController {
  /**
   * GET /api/delivery-zones
   * Liste des zones actives (public — pour le checkout)
   */
  listActiveZones = asyncHandler(async (_req: Request, res: Response) => {
    const zones = await deliveryZoneService.listActiveZones();
    res.status(200).json({ success: true, data: zones });
  });

  /**
   * GET /api/admin/delivery-zones
   * Liste de toutes les zones (admin)
   */
  listZones = asyncHandler(async (_req: Request, res: Response) => {
    const zones = await deliveryZoneService.listZones();
    res.status(200).json({ success: true, data: zones });
  });

  /**
   * GET /api/admin/delivery-zones/:id
   * Détails d'une zone (admin)
   */
  getZone = asyncHandler(async (req: Request, res: Response) => {
    const zone = await deliveryZoneService.getZone(req.params.id);
    res.status(200).json({ success: true, data: zone });
  });

  /**
   * POST /api/admin/delivery-zones
   * Créer une zone
   */
  createZone = asyncHandler(async (req: Request, res: Response) => {
    const zone = await deliveryZoneService.createZone(req.body);
    res.status(201).json({
      success: true,
      message: 'Zone de livraison créée avec succès',
      data: zone,
    });
  });

  /**
   * PUT /api/admin/delivery-zones/:id
   * Modifier une zone
   */
  updateZone = asyncHandler(async (req: Request, res: Response) => {
    const zone = await deliveryZoneService.updateZone(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Zone de livraison mise à jour avec succès',
      data: zone,
    });
  });

  /**
   * DELETE /api/admin/delivery-zones/:id
   * Supprimer une zone
   */
  deleteZone = asyncHandler(async (req: Request, res: Response) => {
    const result = await deliveryZoneService.deleteZone(req.params.id);
    res.status(200).json(result);
  });
}

export const deliveryZoneController = new DeliveryZoneController();
