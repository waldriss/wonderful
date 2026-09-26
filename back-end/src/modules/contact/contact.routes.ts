import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactController } from './contact.controller';
import { requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validation';
import {
  submitContactSchema,
  listContactMessagesQuerySchema,
  contactIdParamSchema,
  changeContactStatusSchema,
} from './contact.dto';

// ============================================
// PUBLIC ROUTES
// ============================================

const router = Router();

// Rate limiting strict pour le formulaire de contact
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 messages max par IP
  message: {
    success: false,
    message: 'Trop de messages envoyés. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact — soumettre un message (public, pas de auth)
router.post(
  '/',
  contactRateLimit,
  validateBody(submitContactSchema),
  contactController.submitMessage
);

export const contactRoutes = router;

// ============================================
// ADMIN ROUTES
// ============================================

const adminRouter = Router();
adminRouter.use(requireAdmin);

// GET /api/admin/contact — liste des messages
adminRouter.get(
  '/',
  validateQuery(listContactMessagesQuerySchema),
  contactController.listMessages
);

// PATCH /api/admin/contact/:id/status — changer le statut
adminRouter.patch(
  '/:id/status',
  validateParams(contactIdParamSchema),
  validateBody(changeContactStatusSchema),
  contactController.changeStatus
);

export const adminContactRoutes = adminRouter;
