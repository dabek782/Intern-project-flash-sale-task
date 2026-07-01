import { Body, Controller, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ReserveTicketDto } from './dto/reserve-ticket.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { JwtAuthGuard } from '../../common/auth-guard';
import { Request } from 'express';

@Controller({
    path: 'orders',
    version: '3',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reserve')
  reserve(@Req() req: Request & { user?: { sub: string; email: string } }, @Body() dto: ReserveTicketDto) {
    return this.ordersService.reserveTicket(dto.ticketId, req.user?.sub ?? 'system');
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() req: Request & { user?: { sub: string; email: string } }, @Param('id') id: string, @Body() dto: PayOrderDto) {
    return this.ordersService.payOrder(id, req.user?.sub ?? 'system', dto.provider);
  }
}
