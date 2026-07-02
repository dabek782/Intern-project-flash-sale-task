import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TicketsGateway } from '../tickets/gateway/tickets.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [EventsService , TicketsGateway],
})
export class EventsModule {}
