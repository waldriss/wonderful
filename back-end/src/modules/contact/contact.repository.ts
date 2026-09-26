import { ContactMessageStatus, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ListContactMessagesQuery } from './contact.dto';

export class ContactRepository {
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return prisma.contactMessage.create({ data });
  }

  async findMany(query: ListContactMessagesQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.contactMessage.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: ContactMessageStatus) {
    return prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }
}

export const contactRepository = new ContactRepository();
