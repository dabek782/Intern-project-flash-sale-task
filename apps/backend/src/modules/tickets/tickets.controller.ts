import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller({
  path: 'tickets',
  version: '3',
})
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.changeStatus(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
  @Get('ticket/:userId')
  getAllCompanyTickets(@Param('userId') userId: string) {
    return this.ticketsService.getAllCompanyTickets(userId);
  }
}
//tickets controller provides endpoint for specified tickets requests