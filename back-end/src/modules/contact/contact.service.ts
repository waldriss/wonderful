import { contactRepository } from './contact.repository';
import { SubmitContactDto, ListContactMessagesQuery, ContactMessageResponse } from './contact.dto';
import { createNotFoundError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { ContactMessageStatus } from '@prisma/client';

export class ContactService {
  async submitMessage(data: SubmitContactDto): Promise<ContactMessageResponse> {
    const message = await contactRepository.create(data);
    return message;
  }

  async listMessages(query: ListContactMessagesQuery) {
    const { data, total } = await contactRepository.findMany(query);
    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async changeStatus(id: string, status: ContactMessageStatus): Promise<ContactMessageResponse> {
    const existing = await contactRepository.findById(id);
    if (!existing) throw createNotFoundError('Message de contact');
    return contactRepository.updateStatus(id, status);
  }
}

export const contactService = new ContactService();
