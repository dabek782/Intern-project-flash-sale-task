import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TicketsGateway } from '../tickets/gateway/tickets.gateway';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService , TicketsGateway],
})
export class OrdersModule {}
