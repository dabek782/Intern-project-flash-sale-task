import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { RedisClientType } from 'redis';

const RESERVATION_TTL_SECONDS = 5 * 60;
const LOCK_TTL_MS = 5000;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {
    setInterval(() => {
      void this.releaseExpiredReservations();
    }, 15_000);
  }

  async reserveTicket(ticketId: string, userId: string) {
    console.log(`Reserving ticket ${ticketId} for user ${userId}`);
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    console.log(`Found ticket: ${ticket ? JSON.stringify(ticket) : 'not found'}`);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }

    if (ticket.status !== 'OPEN') {
      throw new ConflictException('Ticket is not available for reservation');
    }

    const reservationKey = `reservation:${ticketId}:${userId}`;
    const existingReservation = await this.redisClient.get(reservationKey);
    if (existingReservation) {
      throw new ConflictException('You already have an active reservation for this ticket');
    }

    const lock = await this.acquireRedisLock(`lock:ticket:${ticketId}`, LOCK_TTL_MS);

    try {
      const currentTicket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!currentTicket) {
        throw new NotFoundException(`Ticket with id ${ticketId} not found`);
      }

      if (currentTicket.quantity <= 0) {
        throw new ConflictException('Ticket quantity has been exhausted');
      }

      const order = await this.prisma.$transaction(async (tx) => {
        const ticketInTransaction = await tx.ticket.findUnique({ where: { id: ticketId } });
        if (!ticketInTransaction || ticketInTransaction.quantity <= 0) {
          throw new ConflictException('Ticket quantity has been exhausted');
        }

        const updatedTicket = await tx.ticket.update({
          where: { id: ticketId },
          data: { quantity: { decrement: 1 } },
        });

        const order = await tx.orders.create({
          data: {
            id: `order_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            userId: userId,
            eventId: updatedTicket.eventId,
            ticketId: updatedTicket.id,
            status: 'PENDING',
            createdBy: userId,
          },
        });

        await tx.orderItems.create({
          data: {
            orderId: order.id,
            ticketId: updatedTicket.id,
            quantity: 1,
            price: ticketInTransaction.price,
            createdBy: userId,
          },
        });

        await tx.payments.create({
          data: {
            orderId: order.id,
            provider: 'pending',
            status: 'PENDING',
            createdBy: userId,
          },
        });

        return order;
      });

      await this.redisClient.setEx(
        reservationKey,
        RESERVATION_TTL_SECONDS,
        JSON.stringify({
          orderId: order.id,
          ticketId,
          userId,
          expiresAt: Date.now() + RESERVATION_TTL_SECONDS * 1000,
        }),
      );

      return {
        orderId: order.id,
        ticketId,
        status: 'PENDING',
        expiresInSeconds: RESERVATION_TTL_SECONDS,
      };
    } finally {
      await lock.release();
    }
  }

  async payOrder(orderId: string, userId: string, provider: string) {
    const order = await this.prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new ConflictException('Order cannot be paid in its current state');
    }

    if (order.userId !== userId) {
      throw new ConflictException('You cannot pay another user order');
    }

    const reservationKey = `reservation:${order.ticketId}:${order.userId}`;
    const reservation = await this.redisClient.get(reservationKey);
    if (!reservation) {
      throw new ConflictException('Reservation is no longer active');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });

      await tx.payments.update({
        where: { orderId },
        data: { status: 'COMPLETED', provider },
      });
    });

    await this.redisClient.del(reservationKey);

    return { orderId, status: 'COMPLETED', provider };
  }

  private async acquireRedisLock(resource: string, ttlMs: number) {
    const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const acquired = await this.redisClient.set(resource, token, {
      NX: true,
      PX: ttlMs,
    });

    if (acquired !== 'OK') {
      throw new ConflictException('Ticket is currently being reserved, please try again');
    }

    return {
      release: async () => {
        const currentValue = await this.redisClient.get(resource);
        if (currentValue === token) {
          await this.redisClient.del(resource);
        }
      },
    };
  }

  private async releaseExpiredReservations() {
    const cutoff = new Date(Date.now() - RESERVATION_TTL_SECONDS * 1000);
    const staleOrders = await this.prisma.orders.findMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
    });

    for (const order of staleOrders) {
      const reservationKey = `reservation:${order.ticketId}:${order.userId}`;
      const reservation = await this.redisClient.get(reservationKey);
      if (reservation) {
        await this.redisClient.del(reservationKey);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.orders.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });
        await tx.payments.update({
          where: { orderId: order.id },
          data: { status: 'FAILED' },
        });
        await tx.ticket.update({
          where: { id: order.ticketId },
          data: { quantity: { increment: 1 } },
        });
      });
    }
  }
}
