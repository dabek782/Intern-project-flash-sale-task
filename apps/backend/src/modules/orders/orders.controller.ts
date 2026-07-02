import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ReserveTicketDto } from './dto/reserve-ticket.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { JwtAuthGuard } from '../../common/auth-guard';
import { UnauthorizedException } from '@nestjs/common';

@Controller({
    path: 'orders',
    version: '3',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
 @Post('reserve')
  reserve(@Req() req: any, @Body() dto: ReserveTicketDto) {

    const userId = req.user?.sub || req.user?.userId || req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Your id is faulty try logging in later');
    }

    return this.ordersService.reserveTicket(dto.ticketId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() req: any, @Param('id') id: string, @Body() dto: PayOrderDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    
    if (!userId) {
      throw new UnauthorizedException('Brak poprawnego ID użytkownika w tokenie JWT.');
    }

    return this.ordersService.payOrder(id, userId, dto.provider);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    if (!userId) throw new UnauthorizedException('User ID missing');

    return this.ordersService.getMyOrders(userId);
  }

  @Get('company/:companyId/sales-count')
  async getCompanySalesCount(@Param('companyId') companyId: string) {

    return this.ordersService.getTicketsSoldByCompany(Number(companyId));
  }
}
