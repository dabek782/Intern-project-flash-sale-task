import { Body, Controller, Delete, Get, Param, Patch, Post  ,} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {JwtAuthGuard} from '../../common/auth-guard';
import { UseGuards } from '@nestjs/common';
@Controller({
  path: 'events',
  version: '3',
})
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }
    @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  changeStatus(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }
  @Get('user/:userId')
  getAllCompanyEvents(@Param('userId') userId: string) {
    return this.eventsService.getAllCompanyEvents(userId);  
}
}
// events controller specifes endpoints for events specified request