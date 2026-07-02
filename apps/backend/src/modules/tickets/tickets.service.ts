import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Ticket, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTicketDto): Promise<Ticket> {
    const event = await this.prisma.events.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${data.eventId} not found`);
    }

    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${data.companyId} not found`);
    }

    const { companyId, ...ticket } = data;

    return this.prisma.ticket.create({
      data: {
        ...ticket,
        companyId: company.id,
        eventId: event.id,
      },
    });
  }

  findAll(): Promise<Ticket[]> {
    return this.prisma.ticket.findMany();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with id ${data.companyId} not found`);
      }
    }

    if (data.eventId) {
      const event = await this.prisma.events.findUnique({
        where: { id: data.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${data.eventId} not found`);
      }
    }

    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async changeStatus(id: string, data: UpdateTicketDto): Promise<Ticket> {
    await this.findOne(id);

    if (data.status && !Object.values(TicketStatus).includes(data.status)) {
      throw new NotFoundException(`Invalid status ${data.status}`);
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
  }

  async remove(id: string): Promise<Ticket> {
    await this.findOne(id);
    return this.prisma.ticket.delete({ where: { id } });
  }
  async getAllCompanyTickets(userId: string): Promise<Ticket[]> {
    const company = await this.prisma.company.findFirst({
      where: { createdBy: userId },
    });
    const tickets = await this.prisma.ticket.findMany({
      where:{companyId:company?.id}
    })
    return tickets;
  }
}


//tickets.service.ts allows for creation of tickets and other things