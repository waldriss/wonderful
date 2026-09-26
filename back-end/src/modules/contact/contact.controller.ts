import { Request, Response } from 'express';
import { contactService } from './contact.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class ContactController {
  submitMessage = asyncHandler(async (req: Request, res: Response) => {
    const message = await contactService.submitMessage(req.body);
    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message,
    });
  });

  listMessages = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.listMessages(req.query as any);
    res.status(200).json({ success: true, ...result });
  });

  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const message = await contactService.changeStatus(id, status);
    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      data: message,
    });
  });
}

export const contactController = new ContactController();
