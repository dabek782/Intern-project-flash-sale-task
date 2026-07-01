import { Injectable, NotFoundException } from '@nestjs/common';
import { Events } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateEventDto): Promise<Events> {
    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${data.companyId} not found`);
    }

    const { companyId, ...eventData } = data;

    return this.prisma.events.create({
      data: {
        ...eventData,
        company: {
          connect: { id: company.id },
        },
      },
    });
  }

  findAll(): Promise<Events[]> {
    return this.prisma.events.findMany();
  }

  async findOne(id: string): Promise<Events> {
    const event = await this.prisma.events.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: string, data: UpdateEventDto): Promise<Events> {
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new NotFoundException(`Company with id ${data.companyId} not found`);
      }
    }

    await this.findOne(id);
    return this.prisma.events.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Events> {
    await this.findOne(id);
    return this.prisma.events.delete({ where: { id } });
  }
  async changeStatus(id: string, data: UpdateEventDto): Promise<Events> {
    await this.findOne(id);
    return this.prisma.events.update({
      where: { id },
      data,
    });
  }
}
