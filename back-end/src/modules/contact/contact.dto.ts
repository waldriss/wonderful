import { z } from 'zod';
import { ContactMessageStatus } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION
// ============================================

export const submitContactSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().max(20).optional(),
  subject: z.string().min(2, 'Sujet requis').max(200),
  message: z.string().min(10, 'Message trop court').max(5000),
});

export const listContactMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(ContactMessageStatus).optional(),
});

export const contactIdParamSchema = z.object({
  id: z.string().cuid('ID de message invalide'),
});

export const changeContactStatusSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus),
});

// ============================================
// TYPES
// ============================================

export type SubmitContactDto = z.infer<typeof submitContactSchema>;
export type ListContactMessagesQuery = z.infer<typeof listContactMessagesQuerySchema>;
export type ContactIdParam = z.infer<typeof contactIdParamSchema>;
export type ChangeContactStatusDto = z.infer<typeof changeContactStatusSchema>;

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
}
